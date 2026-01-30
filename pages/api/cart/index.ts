import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { z } from "zod";

const cartItemSchema = z.object({
  productId: z.string().cuid(),
  // allow positive or negative deltas; validation for resulting quantity handled in handler
  quantity: z.number().int(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (session.user as any).id;

  switch (req.method) {
    case "GET":
      return handleGetCart(res, userId);
    case "POST":
      return handleAddToCart(req, res, userId);
    case "DELETE":
      return handleRemoveFromCart(req, res, userId);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGetCart(res: NextApiResponse, userId: string) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return res.status(200).json({
      ...cart,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ error: "Failed to fetch cart" });
  }
}

async function handleAddToCart(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const body = cartItemSchema.parse(req.body);
    const { productId, quantity } = body;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Add, increment, or decrement cart item depending on quantity delta
    if (quantity === 0) {
      // no-op
    } else if (quantity > 0) {
      await prisma.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    } else {
      // quantity < 0 -> decrement
      const existing = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      if (!existing) {
        return res.status(400).json({ error: "Cart item not found" });
      }

      const newQty = existing.quantity + quantity; // quantity is negative
      if (newQty > 0) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQty },
        });
      } else {
        // remove item
        await prisma.cartItem.delete({
          where: { id: existing.id },
        });
      }
    }

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const total = updatedCart!.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return res.status(200).json({
      ...updatedCart,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
    }

    console.error("Error adding to cart:", error);
    return res.status(500).json({ error: "Failed to add to cart" });
  }
}

async function handleRemoveFromCart(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { productId } = req.body;

    if (!productId || typeof productId !== "string") {
      return res.status(400).json({
        error: "Validation failed",
        details: [
          { message: "productId is required and must be a string" },
        ],
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const total = updatedCart!.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return res.status(200).json({
      ...updatedCart,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({ error: "Failed to remove from cart" });
  }
}
