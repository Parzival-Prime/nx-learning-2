import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma"
import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit"


export async function getCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const config = await prisma.site_config.findFirst()

        if (!config) {
            return res.status(404).json({ message: "Categories not found" })
        }

        return res.status(200).json({
            categories: config.categories,
            subCategories: config.subCategories
        })
    } catch (error) {
        return next(error)
    }
}

export async function createDiscountCode(req: any, res: Response, next: NextFunction) {
    try {
        const { public_name, discountType, discountValue, discountCode } = req.body

        const isDiscountCodeExist = await prisma.discount_codes.findUnique({
            where: {
                discountCode
            }
        })

        if (isDiscountCodeExist) {
            return next(
                new ValidationError("Discount code already available please use a different code!")
            )
        }

        const discount_codes = await prisma.discount_codes.create({
            data: {
                public_name,
                discountType,
                discountCode,
                discountValue: parseFloat(discountValue),
                sellerId: req.seller.id
            }
        })

        res.status(201).json({
            success: true,
            discount_codes
        })
    } catch (error) {
        return next(error)
    }
}

export async function getDiscountCodes(req: any, res: Response, next: NextFunction) {
    try {
        const discount_codes = await prisma.discount_codes.findMany({
            where: {
                sellerId: req.seller.id
            }
        })

        res.status(201).json({
            success: true,
            discount_codes
        })
    } catch (error) {
        return next(error)
    }
}

export async function deleteDiscountCode(req: any, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const sellerId = req?.seller.id

        const discountCode = await prisma.discount_codes.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true, sellerId: true
            }
        })

        if (!discountCode) {
            return next(new NotFoundError("Discount code not found!"))
        }

        if (discountCode.sellerId !== sellerId) {
            return next(new ValidationError("Unauthorized Access!"))
        }

        await prisma.discount_codes.delete({ where: { id } })

        res.status(200).json({ message: "Discount code successfully deleted!" })
    } catch (error) {
        return next(error)
    }
}

export async function uploadProductImage(req: Request, res: Response, next: NextFunction) {
    try {
        const { filename } = req.body

        const response = await imagekit.upload({
            file: filename,
            fileName: `product-${Date.now()}.jpg`,
            folder: "/products"
        })

        res.status(201).json({
            file_url: response.url,
            fileId: response.fileId
        })
    } catch (error) {
        return next(error)
    }
}

export async function deleteProductImage(req: Request, res: Response, next: NextFunction) {
    try {
        const { fileId } = req.body
        const response = await imagekit.deleteFile(fileId)

        res.status(201).json({
            success: true,
            response
        })
    } catch (error) {
        return next(error)
    }
}

export async function createProduct(req: any, res: Response, next: NextFunction) {
    try {
        const {
            title,
            short_description,
            detailed_description,
            warranty,
            custom_specifications,
            slug,
            tags,
            cash_on_delivery,
            brand,
            video_url,
            category,
            colors = [],
            sizes = [],
            discountCodes,
            stock,
            sale_price,
            regular_price,
            subcategory,
            customProperties = {},
            images = []
        } = req.body

        if (!title || !slug || !short_description || !category || !subcategory || !images || !tags || !brand || !stock || !sale_price || !regular_price) {
            return next(new ValidationError("Missing required fields!"))
        }

        if (!req.seller.id) {
            return next(new AuthError("Only a Seller can create products!"))
        }

        const slugChecking = await prisma.product.findUnique({
            where: {
                slug
            }
        })

        if (slugChecking) {
            return next(new ValidationError("Slug already exist! Please use a different slug!"))
        }


        const newProduct = await prisma.product.create({
            data: {
                title,
                short_description,
                detailed_description,
                warranty,
                cashOnDelivery: cash_on_delivery,
                slug,
                shopId: req?.seller?.shop?.id,
                tags: Array.isArray(tags) ? tags : tags.split(","),
                brand,
                video_url,
                category,
                subCategory: subcategory,
                colors: colors || [],
                discount_codes: discountCodes.map((codeId: string) => codeId),
                sizes: sizes || [],
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price),
                regular_price: parseFloat(regular_price),
                custom_properties: customProperties || {},
                custom_specifications: custom_specifications || {},
                images: {
                    create: images.filter((img: any) => (img && img.fileId && img.file_url)).map((img: any) => ({
                        file_id: img.fileId,
                        url: img.file_url
                    }))
                }
            },
            include: { images: true }
        })

        res.status(201).json({
            success: true,
            newProduct
        })
    } catch (error) {
        return next(error)
    }
}

export async function getShopProducts(req: any, res: Response, next: NextFunction) {
    try {
        const products = await prisma.product.findMany({
            where: {
                shopId: req?.seller?.shop?.id
            },
            include: {
                images: true
            }
        })

        res.status(201).json({
            success: true,
            products
        })
    } catch (error) {
        return next(error)
    }
}

export async function deleteProduct(req: any, res: Response, next: NextFunction) {
    try {
        const {productId} = req.params
        const sellerId = req.seller?.shop?.isDeleted

        const product = await prisma.product.findUnique({
            where: {id: productId},
            select: {id: true, shopId:true, isDeleted: true}
        })


        if(!product) {
            return next(new ValidationError("Product not found!"))
        }

        if(product.shopId !== sellerId) {
            return next(new ValidationError("Unauthorized action!"))
        }

        if(product.isDeleted) {
            return next(new ValidationError("Product is already deleted!"))
        }

        const deletedProduct = await prisma.product.update({
            where: {id: productId},
            data: {
                isDeleted: true,
                deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        })


        
        return res.status(200).json({
            message: "Product is scheduled for deletion in 24 hours. You can restore it within this ",
            deletedAt: deletedProduct.deletedAt
        })
    } catch (error) {
        return next(new ValidationError("Some error occured in deleting process: ", error))
    }
}

export async function restoreProduct(req: any, res: Response, next: NextFunction) {
    try {
        const {productId} = req.params

        const sellerId = req.seller?.shop?.id

        const product = await prisma.product.findUnique({
            where: {id: productId},
            select: {id: true, shopId: true, isDeleted: true}
        })

        if(!product) {
            return next(new ValidationError("Product not found!"))
        }

        if(product.shopId !== sellerId) {
            return next(new ValidationError("Unauthorized action!"))
        }

        if(!product.isDeleted) {
            return res.status(400).json({
                message: "Product is not in deleted state."
            })
        }

        await prisma.product.update({
            where: {id: productId},
            data: {isDeleted: false, deletedAt: null}
        })

        return res.status(200).json({ messgae: "Product successfully restored!" })
    } catch (error) {
        return res.status(500).json({ message: "Error restoring product!", error})
    }
}