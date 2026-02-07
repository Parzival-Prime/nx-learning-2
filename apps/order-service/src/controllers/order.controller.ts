import { NotFoundError, ValidationError } from "@packages/error-handler";
import { Response, NextFunction } from "express";
import Stripe from "stripe"
import crypto from "crypto"
import redis from "@packages/libs/redis"
import prisma from "@packages/libs/prisma"
import { Prisma } from "@/generated/prisma/client";
import { sendEmail } from "../utils/send-email";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover"
})

export async function createPaymentIntent(req: any, res: Response, next: NextFunction) {
    try {
        const { amount, sellerStripeAccountId, sessionId } = req.body
        const customerAmount = Math.round(amount * 100)
        const platformFee = Math.floor(customerAmount * 0.1)

        const paymentIntent = await stripe.paymentIntents.create({
            amount: customerAmount,
            currency: "usd",
            payment_method_types: ["card"],
            application_fee_amount: platformFee,
            transfer_data: {
                destination: sellerStripeAccountId
            },
            metadata: {
                sessionId,
                userId: req.user.id
            }
        })

        res.send({
            clientSecret: paymentIntent.client_secret
        })
    } catch (error) {
        return next(error)
    }
}

export async function createPaymentSession(req: any, res: Response, next: NextFunction) {
    try {
        const { cart, selectedAddressId, coupon } = req.body
        const userId = req.user.id

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return next(new ValidationError("Cart is empty or invalid!"))
        }

        const normalizedCart = JSON.stringify(
            cart.map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {}
            })).sort((a, b) => a.id.localCompare(b.id))
        )

        const keys = await redis.keys("payment-session:*")
        for (const key of keys) {
            const data = await redis.get(key)
            if (data) {
                const session = JSON.parse(data)
                if (session.userId === userId) {
                    const existingCart = JSON.stringify(
                        session.cart.map((item: any) => ({
                            id: item.id,
                            quantity: item.quantity,
                            sale_price: item.sale_price,
                            shopId: item.shopId,
                            selectedOptions: item.selectedOptions || {}
                        })).sort((a: any, b: any) => a.id.localCompare(b.id))
                    )

                    if (existingCart === normalizedCart) {
                        return res.status(200).json({ sessionId: key.split(":")[1] })
                    } else {
                        await redis.del(key)
                    }
                }
            }
        }

        const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))]

        const shops = await prisma.shop.findMany({
            where: {
                id: { in: uniqueShopIds }
            },
            select: {
                id: true,
                seller: {
                    select: {
                        id: true,
                        stripeId: true
                    }
                }
            }
        })

        const sellerData = shops.map((shop) => ({
            shopId: shop.id,
            sellerId: shop.seller?.id,
            stripeId: shop?.seller?.stripeId
        }))

        const totalAmount = cart.reduce((total: number, item: any) => {
            return total + item.quantity * item.sale_price
        }, 0)

        const sessionId = crypto.randomUUID()
        const sessionData = {
            userId,
            cart,
            sellers: sellerData,
            totalAmount,
            shippingAddressId: selectedAddressId || null,
            coupon: coupon || null
        }

        await redis.setex(
            `payment-session:${sessionId}`,
            600,
            JSON.stringify(sessionData)
        )

        return res.status(201).json({ sessionId })
    } catch (error) {
        return next(error)
    }
}

export async function verifyingPaymentSession(req: any, res: Response, next: NextFunction) {
    try {
        const sessionId = req.query.sessionId as string
        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required" })
        }

        const sessionKey = `payment-session:${sessionId}`
        const sessionData = await redis.get(sessionKey)

        if (!sessionData) {
            return res.status(404).json({ error: "Session not found or expired" })
        }

        const session = JSON.parse(sessionData)
        return res.status(200).json({
            success: true,
            session
        })
    } catch (error) {
        return next(error)
    }
}

export async function createOrder(req: any, res: Response, next: NextFunction) {
    try {
        const stripeSignature = req.headers["stripe-siganture"]
        if (!stripeSignature) {
            res.status(400).send("Missing Stripe Signature")
        }

        const rawBody = (req as any).rawBody
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                rawBody,
                stripeSignature,
                process.env.STRIPE_WEBHOOK_SECRET!
            )
        } catch (error) {
            console.error("Webhook signature verification failed.", error.message)
            return res.status(400).send(`Webhook Error: ${error.message}`)
        }

        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            const sessionId = paymentIntent.metadata.sessionId
            const userId = paymentIntent.metadata.userId

            const sessionKey = `payment-session:${sessionId}`
            const sessionData = await redis.get(sessionKey)

            if (!sessionData) {
                console.warn("Session data expired or missing for", sessionId)
                return res.status(200).send("No session found, skipping order creation")
            }

            const { cart, totalAmount, shippingAddressId, coupon } = JSON.parse(sessionData)
            const user = await prisma.user.findUnique({ where: { id: userId } })
            const name = user?.name
            const email = user?.email

            const shopGrouped = cart.reduce((acc: any, item: any) => {
                if (!acc[item.shopId]) acc[item.shopId] = []
                acc[item.shopId].push(item)
                return acc
            }, {})

            for (const shopId in shopGrouped) {
                const orderItems = shopGrouped[shopId]

                let orderTotal = orderItems.reduce(
                    (sum: number, p: any) => sum + p.quantity * p.sale_price, 0
                )

                if (coupon && coupon.discountedProductId && orderItems.some((item: any) => item.id === coupon.discountedProductId)) {
                    const discountedItem = orderItems.find(
                        (item: any) => item.id === coupon.discountedProductId
                    )

                    if (discountedItem) {
                        const discount = coupon.discountPercent > 0 ? (discountedItem.sale_price * discountedItem.quantity * coupon.discountPercent) / 100
                            : coupon.discountAmount

                        orderTotal -= discount
                    }
                }

                await prisma.orders.create({
                    data: {
                        userId,
                        shopId,
                        total: orderTotal,
                        status: "Paid",
                        shippingAddressId: shippingAddressId || null,
                        couponCode: coupon?.discountAmount || 0,
                        items: {
                            create: orderItems.map((item: any) => ({
                                productId: item.id,
                                quantity: item.quantity,
                                price: item.sale_price,
                                selectedOptions: item.selectedOptions
                            }))
                        }
                    }
                })

                for (const item of orderItems) {
                    const { id: productId, quantity } = item

                    await prisma.product.update({
                        where: { id: productId },
                        data: {
                            stock: { decrement: quantity },
                            totalSales: { increment: quantity }
                        }
                    })

                    await prisma.productAnalytics.upsert({
                        where: { productId },
                        create: {
                            productId,
                            shopId,
                            purchases: quantity,
                            lastViewedAt: new Date()
                        },
                        update: {
                            purchases: { increment: quantity }
                        }
                    })

                    const existingAnalytics = await prisma.userAnalytics.findUnique({
                        where: { userId }
                    })

                    const newAction = {
                        productId,
                        shopId,
                        action: "purchase",
                        timestamp: Date.now()
                    }

                    const currentActions = Array.isArray(existingAnalytics?.actions) ? (existingAnalytics.actions as Prisma.JsonArray) : []

                    if (existingAnalytics) {
                        await prisma.userAnalytics.update({
                            where: { userId },
                            data: {
                                lastVisited: new Date(),
                                actions: [...currentActions, newAction]
                            }
                        })
                    } else {
                        await prisma.userAnalytics.create({
                            data: {
                                userId,
                                lastVisited: new Date(),
                                actions: [newAction]
                            }
                        })
                    }
                }

                await sendEmail(email,
                    "Your Eshop Order Confirmation",
                    "order-confirmation",
                    {
                        name,
                        cart,
                        totalAmount: coupon?.discountAmount ? totalAmount - coupon?.discountAmount : totalAmount,
                        trackingUrl: `https://agrigrocer.com/order/${sessionId}`
                    }
                )

                const createdShopIds = Object.keys(shopGrouped)
                const sellerShops = await prisma.shop.findMany({
                    where: { id: { in: createdShopIds } },
                    select: {
                        id: true,
                        name: true,
                        seller: {
                            select: {
                                id: true
                            }
                        }
                    }
                })

                for (const shop of sellerShops) {
                    const firstProduct = shopGrouped[shop.id][0]
                    const productTitle = firstProduct?.title || "new item"

                    await prisma.notification.create({
                            data: {
                                title: "🛒 New Order Received",
                                message: `A customer just ordered ${productTitle} from your shop.`,
                                creatorId: userId,
                                receiverId: shop.seller?.id,
                                redirect_link: `https://agri-grocer.com/order/${sessionId}`
                            }
                        })
                }

                await prisma.notification.create({
                    data: {
                        title: "📦 Platform Order Alert",
                        message: `A new Order was placed by ${name}`,
                        creatorId: userId,
                        receiverId: "admin",
                        redirect_link: `https://agri-grocer.com/order/${sessionId}`
                    }
                })

                await redis.del(sessionKey)
            }
        }

        res.status(200).json({ received: true })

    } catch (error) {
        console.log(error)
        return next(error)
    }
}

export async function getSellerOrders(req: any, res: Response, next: NextFunction) {
    try {
        const shop = await prisma.shop.findFirst({
            where: {
                seller: {
                    id: req.seller.id
                }
            }
        })

        const orders = await prisma.orders.findMany({
            where: {
                shopId: shop?.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        res.status(200).json({
            success: true,
            orders
        })
    } catch (error) {
        return next(error)
    }
}

export async function getOrderDetails(req: any, res: Response, next: NextFunction) {
    try {
        const orderID = req.params.id
        const order = await prisma.orders.findUnique({
            where: {
                id: orderID,
            },
            include: {
                items: true
            }
        })

        if(!order) {
            return next(new NotFoundError("Order not found with the id!"))
        }

        const shippingAddressId = order.shippingAddressId ? await prisma.address.findUnique({
            where: {
                id: order?.shippingAddressId
            }
        }) : null

        const coupon = order.couponCode ? await prisma?.discount_codes.findUnique({
            where: {
                discountCode: order.couponCode
            }
        }) : null


        const productIds = order.items.map((item)=>item.productId)
        const products = await prisma.product.findMany({
            where: {
                id: {in: productIds}
            },
            select: {
                id: true,
                title: true,
                images: true
            }
        })

        const productMap = new Map(products.map((p)=>[p.id,p]))

        const items = order.items.map((item)=>({
            ...item,
            selectedOptions: item.selectedOptions,
            product: productMap.get(item.productId) || null
        }))

        res.status(200).json({
            success: true,
            order: {
                ...order,
                items,
                shippingAddressId,
                couponCode: coupon
            }
        })
    } catch (error) {
        return next(error)
    }
}

export async function updateDeliveryStatus(req: any, res: Response, next: NextFunction) {
    try {
        const {orderId} = req.params
        const {deliveryStatus} = req.body

        if(!orderId || !deliveryStatus) {
            return res.status(400).json({error: "Missing Order ID or deliveryStatus."})
        }

        const allowedStatuses = [
            "Ordered",
            "Packed",
            "Shipped",
            "Out for Delivery",
            "Delivered"
        ]

        if(!allowedStatuses.includes(deliveryStatus)) {
            return next(new ValidationError("Invalid delivery status."))
        }

        const existingOrder = await prisma.orders.findUnique({
            where: {
                id: orderId
            }
        })

        if(!existingOrder) {
            return next(new NotFoundError("Order not found!"))
        }

        const updatedOrder = await prisma.orders.update({
            where: {
                id: orderId,
            },
            data: {
                deliveryStatus,
                updatedAt: new Date()
            }
        })

        return res.status(200).json({
            success: true,
            message: "Delivery status updated successfully.",
            order: updatedOrder
        })
    } catch (error) {
        return next(error)
    }
}
