import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@monkeyprint/db';

export async function GET(request: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get date from query parameters
        const url = new URL(request.url);
        const dateParam = url.searchParams.get('date');

        // Parse the date parameter if it exists
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (dateParam) {
            // Create date from the parameter (assumes YYYY-MM-DD format)
            startDate = new Date(dateParam);
            endDate = new Date(dateParam);

            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                // Set to start and end of the day
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
            } else {
                return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
            }
        }

        // Use the specific store ID as requested
        const storeId = "cm99m628c00008ugfbpm4y5y1";

        // First check if the store exists
        const store = await db.store.findUnique({
            where: {
                id: storeId,
                isDeleted: false
            }
        });

        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // Build query for orders
        const orderQuery: any = {
            storeId: storeId,
            isDeleted: false
        };

        // Add date filter if dates are provided
        if (startDate && endDate) {
            orderQuery.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        // Calculate totals from orders for this store
        const orders = await db.order.findMany({
            where: orderQuery,
            select: {
                totalPrice: true,
                status: true,
                id: true
            }
        });

        // Calculate totals based on order status
        const deliveredTotal = orders
            .filter(o => o.status === 'FULFILLED')
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0);


        // Calculate product counts for delivered and returned orders
        const deliveredProductCount = orders.filter(o => o.status === 'FULFILLED').length;
        const returnedProductCount = orders.filter(o => o.status === 'CANCELED').length;
        
        const returnedTotal = returnedProductCount * 5;
        // Get order counts by status
        const deliveredCount = orders.filter(o => o.status === 'FULFILLED').length;
        const shippingCount = orders.filter(o => o.status === 'CONFIRMED').length;
        const returnedCount = orders.filter(o => o.status === 'CANCELED').length;
        // Detailed breakdown of calculation
        console.log({
            deliveredTotal,
            returnedTotal,
            deliveredProductCount,
            returnedProductCount,
            deliveryFees: 7 * deliveredProductCount,
            returnFees: 5 * returnedProductCount,
            calculatedTotal: deliveredTotal - (7 * deliveredProductCount) - (5 * returnedProductCount)
        });
        // Calculate the total (delivered minus returned)
        const totalAmount = deliveredTotal - (7 * deliveredProductCount) - returnedTotal;

        // Return the calculated values
        const response = {
            total: totalAmount,
            delivered: deliveredTotal,
            returned: returnedTotal,
            deliveredProductCount,
            returnedProductCount,
            currency: "DT",
            orderCounts: {
                delivered: deliveredCount,
                shipping: shippingCount,
                returned: returnedCount
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching wallet data:', error);
        return NextResponse.json({ error: 'Failed to fetch wallet data' }, { status: 500 });
    }
}