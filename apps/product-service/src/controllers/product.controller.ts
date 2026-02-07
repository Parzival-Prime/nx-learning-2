import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma"
import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit"
import { Prisma } from "@/generated/prisma/client";


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
                discount_codes: discountCodes ? discountCodes.map((codeId: string) => codeId) : ["No Discount Available!"],
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
        const { productId } = req.params
        const sellerId = req.seller?.shop?.isDeleted

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, shopId: true, isDeleted: true }
        })


        if (!product) {
            return next(new ValidationError("Product not found!"))
        }

        if (product.shopId !== sellerId) {
            return next(new ValidationError("Unauthorized action!"))
        }

        if (product.isDeleted) {
            return next(new ValidationError("Product is already deleted!"))
        }

        const deletedProduct = await prisma.product.update({
            where: { id: productId },
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
        const { productId } = req.params

        const sellerId = req.seller?.shop?.id

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, shopId: true, isDeleted: true }
        })

        if (!product) {
            return next(new ValidationError("Product not found!"))
        }

        if (product.shopId !== sellerId) {
            return next(new ValidationError("Unauthorized action!"))
        }

        if (!product.isDeleted) {
            return res.status(400).json({
                message: "Product is not in deleted state."
            })
        }

        await prisma.product.update({
            where: { id: productId },
            data: { isDeleted: false, deletedAt: null }
        })

        return res.status(200).json({ messgae: "Product successfully restored!" })
    } catch (error) {
        return res.status(500).json({ message: "Error restoring product!", error })
    }
}

export async function getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20

        const skip = (page - 1) * limit
        const type = req.query.type as "latest" | undefined

        const baseFilter: Prisma.productWhereInput = { isEvent: false }

        const orderBy: Prisma.productOrderByWithRelationInput =
            type === "latest"
                ? { createdAt: "desc" as Prisma.SortOrder }
                : { totalSales: "desc" as Prisma.SortOrder }

        const [products, total, top10Products] = await Promise.all([
            prisma.product.findMany({
                skip,
                take: limit,
                include: {
                    images: true,
                    shop: true
                },
                where: baseFilter,
                orderBy
            }),

            prisma.product.count({ where: baseFilter}),
            prisma.product.findMany({
                take: 10,
                orderBy,
                include: {
                    images: true,
                    shop: true
                },
                where: baseFilter
            })
        ])

        res.status(200).json({
            products,
            top10By: type === "latest" ? "latest" : "topSales",
            top10Products,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        })

    } catch (error) {
        return next(error)
    }
}

export async function getAllEvents(req: Request, res: Response, next: NextFunction){
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20

        const skip = (page - 1) * limit
        const type = req.query.type as "latest" | undefined

        const baseFilter: Prisma.productWhereInput = { isEvent: true }

        const orderBy: Prisma.productOrderByWithRelationInput =
            type === "latest"
                ? { createdAt: "desc" as Prisma.SortOrder }
                : { totalSales: "desc" as Prisma.SortOrder }

        const [products, total, top10Products] = await Promise.all([
            prisma.product.findMany({
                skip,
                take: limit,
                include: {
                    images: true,
                    shop: true
                },
                where: baseFilter,
                orderBy
            }),

            prisma.product.count({ where: baseFilter}),
            prisma.product.findMany({
                take: 10,
                orderBy,
                include: {
                    images: true,
                    shop: true
                },
                where: baseFilter
            })
        ])

        res.status(200).json({
            products,
            top10By: type === "latest" ? "latest" : "topSales",
            top10Products,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return next(error)
    }
}

export async function getProductDetails(req: Request, res: Response, next: NextFunction){
    try {
        const product = await prisma.product.findUnique({
            where: {
                slug: req.params.slug!
            },
            include:  {
                images: true,
                shop: true
            }
        })

        res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        return next(error)
    }
}

export async function getFilteredProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      priceRange = "0,10000",
      categories,
      colors,
      sizes,
      page = "1",
      limit = "12",
    } = req.query;

    const parseList = (value: any): string[] =>
      typeof value === "string" ? value.split(",") : [];

    const parsedPriceRange = String(priceRange).split(",").map(Number);
    const parsedCategories = parseList(categories);
    const parsedColors = parseList(colors);
    const parsedSizes = parseList(sizes);

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
    };

    if (parsedCategories.length > 0) {
      filters.category = { in: parsedCategories };
    }

    if (parsedColors.length > 0) {
      filters.colors = { hasSome: parsedColors };
    }

    if (parsedSizes.length > 0) {
      filters.sizes = { hasSome: parsedSizes };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.product.count({ where: filters }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFilteredEvents(req: Request, res: Response, next: NextFunction){
    try {
        const {
            priceRange = [0, 10000],
            categories=[],
            colors=[],
            sizes=[],
            page=1,
            limit=12
        } = req.query


        const parsedPriceRange = typeof priceRange === "string" ? priceRange.split(",").map(Number) : [0, 10000]
        const parsedPage = Number(page)
        const parsedLimit = Number(limit)

        const skip = (parsedPage - 1) * parsedLimit
        const filters: Record<string, any> = {
            sale_price: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1]
            },
            NOT: {
                starting_date: null
            }
        }

        if(categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) ? categories : String(categories).split(",")
            }
        }

        if(colors && (colors as string[]).length > 0) {
            filters.colors = {
                hasSome: Array.isArray(colors) ? colors : [colors]
            }
        }

        if(sizes && (sizes as string[]).length > 0) {
            filters.sizes = {
                hasSome: Array.isArray(sizes) ? sizes : [sizes]
            }
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    images: true,
                    shop: true
                }
            }),

            prisma.product.count({ where: filters })
        ])

        const totalPages = Math.ceil(total/ parsedLimit)

        res.json({
            products,
            pagination: {
                total,
                page: parsedPage,
                totalPages
            }
        })
    } catch (error) {
        return next(error)
    }
}

export async function getFilteredShops(req: Request, res: Response, next: NextFunction){
    try {
        const {
            categories=[],
            countries=[],
            page=1,
            limit=12
        } = req.query


        // const parsedPriceRange = typeof priceRange === "string" ? priceRange.split(",").map(Number) : [0, 10000]
        const parsedPage = Number(page)
        const parsedLimit = Number(limit)

        const skip = (parsedPage - 1) * parsedLimit
        const filters: Record<string, any> = {}

        if(categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) ? categories : String(categories).split(",")
            }
        }

        if(countries && (countries as string[]).length > 0) {
            filters.countries = {
                hasSome: Array.isArray(countries) ? countries : [countries]
            }
        }

        const [shops, total] = await Promise.all([
            prisma.shop.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    seller: true,
                    followers: true,
                    products: true
                }
            }),

            prisma.shop.count({ where: filters })
        ])

        const totalPages = Math.ceil(total/ parsedLimit)

        res.json({
            shops,
            pagination: {
                total,
                page: parsedPage,
                totalPages
            }
        })
    } catch (error) {
        return next(error)
    }
}

export async function searchProducts(req: Request, res: Response, next: NextFunction){
    try {
        const query = req.query.q as string
        if(!query || query.trim().length === 0){
            return res.status(400).json({message: "Search query is required."})
        }

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    {
                        title:  {
                            contains: query,
                            mode: "insensitive",

                        },
                        short_description: {
                            contains: query,
                            mode: "insensitive",
                        }
                    }
                ]
            },
            select: {
                id: true,
                title: true,
                slug: true
            },
            take: 10,
            orderBy: {
                createdAt: "desc"
            }
        })

        return res.status(200).json({ products })
    } catch (error) {
        return next(error)
    }
}

export async function topShops(req: Request, res: Response, next: NextFunction){
    try {
        const topShopsData = await prisma.orders.groupBy({
            by: ["shopId"],
            _sum: {
                total: true
            },
            orderBy: {
                _sum: {
                    total: "desc"
                }
            },
            take: 10,
        })

        const shopIds = topShopsData.map((item)=>item.shopId)

        const shops = await prisma.shop.findMany({
            where: {
                id: {
                    in: shopIds,
                }
            },
            select: {
                id: true,
                name: true,
                logo: true,
                coverBanner: true,
                address: true,
                ratings: true,
                followers: true,
                category: true
            }
        })

        const enrichedShops = shops.map((shop)=>{
            const salesData = topShopsData.find((s)=>s.shopId === shop.id)
            return {
                ...shop,
                totalSales: salesData?._sum.total ?? 0
            }
        })

        const top10Shops = enrichedShops.sort((a, b)=>b.totalSales - a.totalSales).slice(0, 10)

        res.status(200).json({
            shops: top10Shops
        })
    } catch (error) {
        console.error("Error fetching top shops: ", error)
        return next(error)
    }
}

