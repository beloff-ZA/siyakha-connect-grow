interface ProjectServicesProps {
  services: readonly string[];
  className?: string;
}

const ProjectServices = ({ services, className = "" }: ProjectServicesProps) => {
  if (services.length === 0) return null;

  return (
    <ul aria-label="Project services" className={`flex flex-wrap gap-2 ${className}`}>
      {services.map((service) => (
        <li key={service} className="max-w-full border border-foreground/20 px-2.5 py-1 text-xs leading-relaxed text-foreground/75 break-words">
          {service}
        </li>
      ))}
    </ul>
  );
};

export default ProjectServices;