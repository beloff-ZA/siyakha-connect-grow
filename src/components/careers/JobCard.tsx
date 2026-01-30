import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, ChevronRight } from "lucide-react";

interface Job {
  id: string;
  title: string;
  location: string;
  department: string;
  employment_type: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
}

const JobCard = ({ job, onApply }: JobCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            {job.department}
          </Badge>
          <Badge variant="outline">{job.employment_type}</Badge>
        </div>
        <CardTitle className="text-xl font-bold text-primary group-hover:text-accent transition-colors">
          {job.title}
        </CardTitle>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            {job.department}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {job.employment_type}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {job.description}
        </p>
        
        {job.requirements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-primary mb-2">Key Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {job.requirements.slice(0, 3).map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
              {job.requirements.length > 3 && (
                <li className="text-accent text-xs">+{job.requirements.length - 3} more requirements</li>
              )}
            </ul>
          </div>
        )}

        <Button 
          onClick={() => onApply(job)} 
          className="w-full cta-primary group/btn"
        >
          Apply Now
          <ChevronRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCard;
