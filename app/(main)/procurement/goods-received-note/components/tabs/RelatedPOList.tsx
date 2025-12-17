"use client";

import React, { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderStatus } from '@/lib/types'; // Import PurchaseOrderStatus
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// --- Placeholder Fetch Function ---
// Replace with your actual API call to get PO summaries
async function getPurchaseOrderSummary(poRef: string): Promise<Partial<PurchaseOrder> | null> {
    console.log(`[API CALL] Fetching PO Summary for Ref: ${poRef}`);
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

    // Mock data based on ref - replace with real fetch
    if (poRef === 'PO-2310-006') {
        return {
            poId: 'PO006',
            number: poRef,
            vendorName: 'Professional Kitchen Supplies',
            orderDate: new Date('2023-08-01'),
            status: PurchaseOrderStatus.CLOSED,
        } as any;
    } else if (poRef === 'PO-2310-007') {
         return {
            poId: 'PO007',
            number: poRef,
            vendorName: 'General Foodstuffs Inc.',
            orderDate: new Date('2023-08-05'),
            status: PurchaseOrderStatus.OPEN,
        } as any;
    }
    return null;
}
// --- End Placeholder ---

interface RelatedPOListProps {
    poRefs: string[];
}

export function RelatedPOList({ poRefs }: RelatedPOListProps) {
    const [poSummaries, setPoSummaries] = useState<Partial<PurchaseOrder>[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (poRefs && poRefs.length > 0) {
            setIsLoading(true);
            Promise.all(poRefs.map(ref => getPurchaseOrderSummary(ref)))
                .then(results => {
                    // Filter out null results (e.g., PO not found)
                    setPoSummaries(results.filter(po => po !== null) as Partial<PurchaseOrder>[]);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching PO summaries:", error);
                    setIsLoading(false);
                    setPoSummaries([]); // Clear on error
                });
        } else {
            setPoSummaries([]); // Clear if no refs
        }
    }, [poRefs]);

    if (isLoading) {
        return <div>Loading related purchase orders...</div>;
    }

    if (!poSummaries || poSummaries.length === 0) {
        return <p>No related purchase orders found for this Goods Receive Note.</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Related Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>PO Number</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {poSummaries.map((po) => (
                            <TableRow key={(po as any).poId || po.id}>
                                <TableCell>{(po as any).number || po.orderNumber || 'N/A'}</TableCell>
                                <TableCell>{(po as any).vendorName || 'N/A'}</TableCell>
                                <TableCell>{((po as any).orderDate || po.expectedDeliveryDate) ? new Date((po as any).orderDate || po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell><Badge variant={(po as any).status === 'Closed' ? 'secondary' : 'default'}>{(po as any).status || 'N/A'}</Badge></TableCell>
                                <TableCell>
                                    {((po as any).poId || po.id) && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/procurement/purchase-orders/${(po as any).poId || po.id}`} target="_blank">
                                                View PO <ExternalLink className="ml-2 h-3 w-3" />
                                            </Link>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 