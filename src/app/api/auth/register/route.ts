import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Email já cadastrado." },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    }
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}
