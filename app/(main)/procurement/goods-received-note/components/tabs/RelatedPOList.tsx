"use client";

import React, { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText } from 'lucide-react';
import { Mock_purchaseOrders } from '@/lib/mock/mock_purchaseOrder';

/**
 * Get PO summary by order number (poRef)
 * Looks up from mock data using orderNumber field
 */
async function getPurchaseOrderSummary(poRef: string): Promise<Partial<PurchaseOrder> | null> {
    // Simulate network delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find PO by orderNumber in mock data
    const po = Mock_purchaseOrders.find(
        p => p.orderNumber === poRef || p.id === poRef
    );

    if (po) {
        return {
            id: po.id,
            orderNumber: po.orderNumber,
            vendorName: po.vendorName,
            orderDate: po.orderDate,
            expectedDeliveryDate: po.expectedDeliveryDate,
            status: po.status,
            totalAmount: po.totalAmount,
            totalItems: po.totalItems,
            receivedItems: po.receivedItems,
            pendingItems: po.pendingItems,
        } as Partial<PurchaseOrder>;
    }

    // If not found in mock data, generate placeholder based on ref
    // This handles cases where GRN references POs not in our mock data
    if (poRef && poRef.startsWith('PO-')) {
        return {
            id: poRef,
            orderNumber: poRef,
            vendorName: 'Vendor (Data Pending)',
            orderDate: new Date(),
            status: 'pending' as any,
        } as Partial<PurchaseOrder>;
    }

    return null;
}

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

    // Helper to format date safely
    const formatDate = (date: any): string => {
        if (!date) return 'N/A';
        try {
            const d = date instanceof Date ? date : new Date(date);
            return d.toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    // Helper to get status badge variant
    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status?.toLowerCase()) {
            case 'closed':
            case 'completed':
            case 'received':
                return 'secondary';
            case 'sent':
            case 'approved':
            case 'open':
                return 'default';
            case 'cancelled':
            case 'rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Helper to format status label
    const formatStatus = (status: string): string => {
        if (!status) return 'N/A';
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <FileText className="h-8 w-8 text-gray-300" />
                        <p className="text-gray-500">Loading related purchase orders...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!poSummaries || poSummaries.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No related purchase orders found for this Goods Receive Note.</p>
                    <p className="text-sm text-gray-400 mt-2">Purchase order references will appear here when items are received against POs.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Related Purchase Orders ({poSummaries.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>PO Number</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {poSummaries.map((po) => (
                            <TableRow key={po.id || po.orderNumber}>
                                <TableCell className="font-medium">{po.orderNumber || 'N/A'}</TableCell>
                                <TableCell>{po.vendorName || 'N/A'}</TableCell>
                                <TableCell>{formatDate(po.orderDate)}</TableCell>
                                <TableCell>
                                    {po.totalItems !== undefined ? (
                                        <span className="text-sm">
                                            {po.receivedItems || 0}/{po.totalItems} received
                                        </span>
                                    ) : (
                                        'N/A'
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(po.status as string)}>
                                        {formatStatus(po.status as string)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {po.id && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/procurement/purchase-orders/${po.id}`} target="_blank">
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