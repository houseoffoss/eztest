import { useEffect, useState } from 'react';

export interface TestSuite {
  id: string;
  name: string;
}

export interface TestRun {
  id: string;
  name: string;
}

export function useTestSuites(projectId: string) {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestSuites = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/testsuites`);
        if (response.ok) {
          const data = await response.json();
          setTestSuites(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch test suites:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchTestSuites();
    }
  }, [projectId]);

  return { testSuites, loading };
}

export function useTestRuns(projectId: string) {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestRuns = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/testruns`);
        if (response.ok) {
          const data = await response.json();
          setTestRuns(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch test runs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchTestRuns();
    }
  }, [projectId]);

  return { testRuns, loading };
}
