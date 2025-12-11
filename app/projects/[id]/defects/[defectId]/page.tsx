import DefectDetail from '@/frontend/components/defect/detail/DefectDetail';

interface DefectDetailPageProps {
  params: Promise<{
    id: string;
    defectid: string;
  }>;
}

export default async function DefectDetailPage({
  params,
}: DefectDetailPageProps) {
  const { id, defectid } = await params;

  return <DefectDetail projectId={id} defectId={defectid} />;
}
