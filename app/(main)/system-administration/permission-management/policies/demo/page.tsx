'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  PolicyBuilderDashboard,
  VisualPolicyEditor,
  AttributeInspector,
  PolicyTester,
  RuleConditionBuilder
} from '@/components/permissions/policy-builder';
import { 
  PolicyBuilderState,
  PolicyTestResult 
} from '@/lib/types/policy-builder';
import { allAttributes } from '@/lib/mock-data/policy-builder-attributes';
import { allMockPolicies } from '@/lib/mock-data/permission-index';

export default function PolicyBuilderDemoPage() {
  const [demoTab, setDemoTab] = useState('dashboard');
  const [selectedComponent, setSelectedComponent] = useState<string>('');

  const handleCreatePolicy = () => {
    console.log('Create policy clicked');
  };

  const handleEditPolicy = (policyId: string) => {
    console.log('Edit policy:', policyId);
  };

  const handleViewPolicy = (policyId: string) => {
    console.log('View policy:', policyId);
  };

  const handleDeletePolicy = (policyId: string) => {
    console.log('Delete policy:', policyId);
  };

  const handleDuplicatePolicy = (policyId: string) => {
    console.log('Duplicate policy:', policyId);
  };

  const handlePolicySave = (policy: PolicyBuilderState) => {
    console.log('Policy saved:', policy);
  };

  const handlePolicyCancel = () => {
    console.log('Policy editing cancelled');
  };

  const handlePolicyChange = (policy: PolicyBuilderState) => {
    console.log('Policy changed:', policy);
  };

  const handleTestComplete = (result: PolicyTestResult) => {
    console.log('Test completed:', result);
  };

  const handleAttributeSelect = (attribute: any) => {
    console.log('Attribute selected:', attribute);
  };

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ABAC Policy Builder - Demo</h1>
        <p className="text-muted-foreground">
          Interactive demonstration of the comprehensive Policy Builder UI components for Carmen ERP's ABAC system.
        </p>
      </div>

      <Tabs value={demoTab} onValueChange={setDemoTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="editor">Visual Editor</TabsTrigger>
          <TabsTrigger value="inspector">Attribute Inspector</TabsTrigger>
          <TabsTrigger value="tester">Policy Tester</TabsTrigger>
          <TabsTrigger value="builder">Condition Builder</TabsTrigger>
        </TabsList>

        {/* Dashboard Demo */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Builder Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Main dashboard component with policy list, search/filter capabilities, quick actions, and performance metrics.
              </p>
            </CardContent>
          </Card>
          
          <PolicyBuilderDashboard
            onCreatePolicy={handleCreatePolicy}
            onEditPolicy={handleEditPolicy}
            onViewPolicy={handleViewPolicy}
            onDeletePolicy={handleDeletePolicy}
            onDuplicatePolicy={handleDuplicatePolicy}
          />
        </TabsContent>

        {/* Visual Editor Demo */}
        <TabsContent value="editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual Policy Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Step-by-step policy creation wizard with real-time validation and preview capabilities.
              </p>
              <div className="h-[600px] border rounded-lg overflow-hidden">
                <VisualPolicyEditor
                  onSave={handlePolicySave}
                  onCancel={handlePolicyCancel}
                  onChange={handlePolicyChange}
                  readonly={false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attribute Inspector Demo */}
        <TabsContent value="inspector" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attribute Inspector</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse and select attributes with search, filtering, and detailed information display.
              </p>
              <div className="h-[600px]">
                <AttributeInspector
                  onAttributeSelect={handleAttributeSelect}
                  showSearch={true}
                  showFavorites={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Tester Demo */}
        <TabsContent value="tester" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Real-time policy validation with mock requests, performance metrics, and detailed evaluation traces.
              </p>
              <div className="h-[600px]">
                <PolicyTester
                  policies={allMockPolicies}
                  onTestComplete={handleTestComplete}
                  showPerformanceMetrics={true}
                  enableBatchTesting={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Condition Builder Demo */}
        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rule Condition Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Complex condition builder with expression editor, visual tree, and template support.
              </p>
              <RuleConditionBuilder
                availableAttributes={allAttributes}
                onChange={(conditions) => console.log('Conditions changed:', conditions)}
                onValidationChange={(validation) => console.log('Validation changed:', validation)}
                showTemplates={true}
                allowNesting={true}
                maxDepth={3}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">PolicyBuilderDashboard</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Policy list with search/filter</li>
                <li>Quick actions (Create, Import, Export)</li>
                <li>Policy status indicators</li>
                <li>Recent activity feed</li>
                <li>Performance metrics</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">VisualPolicyEditor</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Step-by-step policy wizard</li>
                <li>Real-time validation</li>
                <li>Subject/Resource/Action/Environment</li>
                <li>Rule condition builder integration</li>
                <li>Policy preview and testing</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">AttributeInspector</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Tabbed interface by category</li>
                <li>Search and filter capabilities</li>
                <li>Attribute details with examples</li>
                <li>Favorites system</li>
                <li>Grouped by tags</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">PolicyTester</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Single and batch testing</li>
                <li>Mock request builder</li>
                <li>Policy simulation results</li>
                <li>Performance metrics display</li>
                <li>Evaluation trace visualization</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">RuleConditionBuilder</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Visual condition tree</li>
                <li>Expression syntax highlighting</li>
                <li>Predefined condition templates</li>
                <li>Nested condition groups</li>
                <li>Real-time validation</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Integration Features</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Carmen ERP design system</li>
                <li>TypeScript type safety</li>
                <li>Accessibility compliance</li>
                <li>Responsive design</li>
                <li>Error handling & validation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}