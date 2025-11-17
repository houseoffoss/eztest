import ProjectList from '@/app/frontend/components/project/ProjectList';
import CONFIG_SEO from '@/config/configSEO';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: CONFIG_SEO.Projects.title,
  description: CONFIG_SEO.Projects.description,
};

const ProjectsPage = () => {
  return <ProjectList />;
};

export default ProjectsPage;
