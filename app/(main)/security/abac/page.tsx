
// app/(main)/security/abac/page.tsx
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Policy, Operator, ResourceType } from '@/types/abac';
import { PolicyEditor } from '@/components/abac/policy-editor';
import { PolicyDataTable } from '@/components/abac/policy-data-table';
import { getPolicyColumns } from '@/components/abac/policy-columns';

// Mock data based on docs/architecture/abac-design.md
const mockPolicies: Policy[] = [
  {
    id: 'pol-001',
    name: 'Department Manager PR Approval',
    description: 'Department managers can approve PRs from their department up to $10,000',
    priority: 100,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.EQUALS, value: 'department-manager' },
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.PURCHASE_REQUEST },
      ],
      actions: ['approve_department'],
    },
    rules: [
      {
        id: 'rule-001',
        description: 'Same department and within approval limit',
        condition: {
          type: 'composite',
          logicalOperator: 'AND',
          expressions: [
            {
              type: 'simple',
              attribute: 'subject.department.id',
              operator: Operator.EQUALS,
              value: 'resource.ownerDepartment',
            },
            {
              type: 'simple',
              attribute: 'resource.totalValue.amount',
              operator: Operator.LESS_THAN_OR_EQUAL,
              value: 10000,
            },
          ],
        },
      },
    ],
    effect: 'permit',
  },
  {
    id: 'pol-002',
    name: 'Warehouse Staff Inventory Access',
    description: 'Warehouse staff can only manage inventory in their assigned locations during work hours',
    priority: 90,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['warehouse-manager', 'staff'] },
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.IN, value: [ResourceType.INVENTORY_ITEM, ResourceType.STOCK_ADJUSTMENT] },
      ],
      actions: ['view_stock', 'adjust_quantity'],
    },
    rules: [
      {
        id: 'rule-002',
        description: 'Location match and business hours',
        condition: {
          type: 'composite',
          logicalOperator: 'AND',
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.location',
              operator: Operator.IN,
              value: 'subject.locations',
            },
            {
              type: 'simple',
              attribute: 'environment.isBusinessHours',
              operator: Operator.EQUALS,
              value: true,
            },
          ],
        },
      },
    ],
    effect: 'permit',
  },
  {
    id: 'pol-003',
    name: 'Financial Data Access',
    description: 'Financial data visible only to authorized roles from secure locations',
    priority: 110,
    enabled: false,
    target: {
      resources: [
        { attribute: 'dataClassification', operator: Operator.IN, value: ['confidential', 'restricted'] },
      ],
      actions: ['view', 'export'],
    },
    rules: [
      {
        id: 'rule-003',
        description: 'Finance role or manager with secure access',
        condition: {
          type: 'simple',
          attribute: 'subject.role.id',
          operator: Operator.IN,
          value: ['financial-manager', 'admin'],
        },
      },
    ],
    effect: 'permit',
  },
];

export default function ABACSettingsPage() {
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const handleAddNew = () => {
    setSelectedPolicy(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsEditorOpen(true);
  };

  const handleDelete = (policyId: string) => {
    setPolicies(policies.filter((p) => p.id !== policyId));
  };

  const handleSave = (policy: Policy) => {
    if (selectedPolicy) {
      setPolicies(policies.map((p) => (p.id === policy.id ? policy : p)));
    } else {
      setPolicies([...policies, { ...policy, id: `pol-${Date.now()}` }]);
    }
    setIsEditorOpen(false);
  };

  const columns = getPolicyColumns(handleEdit, handleDelete);

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ABAC Policies</h1>
          <p className="text-muted-foreground">
            Manage and configure Attribute-Based Access Control policies.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 md:mt-0">
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Policy
          </Button>
        </div>
      </div>

      <PolicyDataTable columns={columns} data={policies} onEdit={handleEdit} onDelete={handleDelete} />

      {isEditorOpen && (
        <PolicyEditor
          policy={selectedPolicy}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
