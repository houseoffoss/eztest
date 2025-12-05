import DefectDetail from '@/frontend/components/defect/detail/DefectDetail';

interface DefectDetailPageProps {
  params: Promise<{
    id: string;
    defectId: string;
  }>;
}

export default async function DefectDetailPage({
  params,
}: DefectDetailPageProps) {
  const { id, defectId } = await params;

  return <DefectDetail projectId={id} defectId={defectId} />;
}
