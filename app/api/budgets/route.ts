import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/lib/models/Budget';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    const month = monthParam ? new Date(monthParam) : new Date();
    
    await dbConnect();
    
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);
    
    const budgets = await Budget.find({
      month: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();
    
    // Convert month string to Date and set to start of month
    const month = startOfMonth(new Date(body.month));
    const budget = await Budget.findOneAndUpdate(
      { category: body.category, month },
      { ...body, month },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}