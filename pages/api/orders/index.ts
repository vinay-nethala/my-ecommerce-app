import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (session.user as any).id;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // For now, create a very small "order" behavior: capture totals and clear cart
    const total = cart.items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

    // In a real app you'd create an Order model and persist details. We'll simply clear the cart.
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return res.status(200).json({ success: true, total: parseFloat(total.toFixed(2)) });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }
}
