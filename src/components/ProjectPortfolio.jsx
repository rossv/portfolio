import { useState } from 'react';
import projects from '../data/project.json';
import ExperienceMap from './ExperienceMap';
import ProjectDashboard from './ProjectDashboard';

export default function ProjectPortfolio() {
    const [filteredProjects, setFilteredProjects] = useState(projects);

    return (
        <>
            <div className="mb-16">
                <ExperienceMap projects={filteredProjects} />
            </div>
            <ProjectDashboard onFilteredProjects={setFilteredProjects} />
        </>
    );
}
