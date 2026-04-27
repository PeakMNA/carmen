'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  VisualPolicyEditor,
  PolicyTester,
  AttributeInspector
} from '@/components/permissions/policy-builder';
import { LogicalOperator } from '@/lib/types/permissions';
import { 
  PolicyBuilderState,
  PolicyTestResult 
} from '@/lib/types/policy-builder';
import { allMockPolicies } from '@/lib/mock-data/permission-index';

export default function PolicyBuilderPage() {
  const router = useRouter();
  const [currentPolicy, setCurrentPolicy] = useState<PolicyBuilderState | null>(null);
  const [showTester, setShowTester] = useState(false);

  const handleCreatePolicy = () => {
    setCurrentPolicy(null);
    setShowTester(false);
  };

  const handleEditPolicy = (policyId: string) => {
    // Load policy for editing
    const policy = allMockPolicies.find(p => p.id === policyId);
    if (policy) {
      // Convert Policy to PolicyBuilderState
      const builderState: PolicyBuilderState = {
        name: policy.name,
        description: policy.description,
        priority: policy.priority,
        enabled: policy.enabled,
        effect: policy.effect,
        logicalOperator: LogicalOperator.AND,
        subjectConditions: policy.target.subjects || [],
        resourceConditions: policy.target.resources || [],
        actionConditions: policy.target.actions || [],
        environmentConditions: policy.target.environment || [],
        rules: policy.rules,
        testScenarios: policy.testScenarios || [],
        version: policy.version,
        category: policy.category,
        tags: policy.tags,
        effectiveFrom: policy.effectiveFrom,
        effectiveTo: policy.effectiveTo
      };
      setCurrentPolicy(builderState);
      setShowTester(false);
    }
  };

  const handleSavePolicy = (policy: PolicyBuilderState) => {
    console.log('Saving policy:', policy);
    // In a real implementation, this would save to the backend
    router.push('/system-administration/permission-management/policies');
  };

  const handleCancelEdit = () => {
    router.push('/system-administration/permission-management/policies');
  };

  const handlePolicyChange = (policy: PolicyBuilderState) => {
    setCurrentPolicy(policy);
  };

  const handleTestComplete = (result: PolicyTestResult) => {
    console.log('Test completed:', result);
  };

  if (currentPolicy !== null) {
    // Show policy editor
    return (
      <div className="h-screen flex flex-col">
        <VisualPolicyEditor
          initialPolicy={currentPolicy}
          onSave={handleSavePolicy}
          onCancel={handleCancelEdit}
          onChange={handlePolicyChange}
          readonly={false}
        />
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/system-administration/permission-management/policies')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Policies
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ABAC Policy Builder</h1>
          <p className="text-muted-foreground">
            Advanced tools for creating, testing, and managing attribute-based access control policies.
          </p>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Policy Builder</TabsTrigger>
          <TabsTrigger value="tester">Policy Tester</TabsTrigger>
          <TabsTrigger value="attributes">Attribute Explorer</TabsTrigger>
        </TabsList>

        {/* Policy Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-lg font-semibold">Create New Policy</div>
                  <p className="text-muted-foreground">
                    Use the visual policy editor to create comprehensive ABAC policies with step-by-step guidance.
                  </p>
                  <Button onClick={handleCreatePolicy} size="lg">
                    Start Building Policy
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-lg font-semibold">Test Existing Policies</div>
                  <p className="text-muted-foreground">
                    Validate your policies with real-world scenarios and performance testing.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTester(true)} 
                    size="lg"
                  >
                    Open Policy Tester
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Policy Tester Tab */}
        <TabsContent value="tester" className="space-y-6">
          <PolicyTester
            policies={allMockPolicies}
            onTestComplete={handleTestComplete}
            showPerformanceMetrics={true}
            enableBatchTesting={true}
          />
        </TabsContent>

        {/* Attribute Explorer Tab */}
        <TabsContent value="attributes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-0">
                <AttributeInspector
                  onAttributeSelect={(attribute) => {
                    console.log('Selected attribute:', attribute);
                  }}
                  showSearch={true}
                  showFavorites={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-lg font-semibold">Attribute Information</div>
                  <p className="text-muted-foreground">
                    Select an attribute from the inspector to view detailed information including:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Data type and valid operators</li>
                    <li>Example values and usage patterns</li>
                    <li>Performance characteristics</li>
                    <li>Related attributes and dependencies</li>
                    <li>Best practices and recommendations</li>
                  </ul>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Quick Reference</div>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div><span className="font-medium">Subject:</span> Who is making the request (user attributes)</div>
                      <div><span className="font-medium">Resource:</span> What is being accessed (resource attributes)</div>
                      <div><span className="font-medium">Action:</span> What operation is being performed</div>
                      <div><span className="font-medium">Environment:</span> When/where the request occurs</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Policy Tester Modal/Dialog */}
      {showTester && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[80vh] bg-background border rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Policy Tester</h2>
              <Button variant="ghost" onClick={() => setShowTester(false)}>
                ×
              </Button>
            </div>
            <div className="h-[calc(100%-64px)] overflow-hidden">
              <PolicyTester
                policies={allMockPolicies}
                onTestComplete={handleTestComplete}
                showPerformanceMetrics={true}
                enableBatchTesting={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}