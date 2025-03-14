
import { Service } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Car, User, AlertTriangle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedTransition from "./AnimatedTransition";

interface ServiceCardProps {
  service: Service;
  index: number;
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const getCategoryIcon = () => {
    switch (service.category) {
      case "Veículo":
        return <Car className="h-4 w-4" />;
      case "Habilitação":
        return <User className="h-4 w-4" />;
      case "Infrações":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const totalItems = service.checklists.reduce(
    (acc, checklist) => acc + checklist.items.length, 
    0
  );

  return (
    <AnimatedTransition
      animation="scale"
      delay={index * 0.05}
      className="h-full"
    >
      <Link to={`/service/${service.id}`} className="block h-full">
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md hover:bg-card/80 transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Badge 
                variant="outline"
                className="flex items-center gap-1 text-xs font-normal"
              >
                {getCategoryIcon()}
                {service.category}
              </Badge>
            </div>
            <CardTitle className="text-xl mt-3 font-semibold line-clamp-2">
              {service.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
              {service.description}
            </p>
            <div className="flex justify-between items-center mt-auto pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                {totalItems} {totalItems === 1 ? 'documento' : 'documentos'}
              </div>
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </AnimatedTransition>
  );
}
