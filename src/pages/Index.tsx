
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { initialServices } from '@/data/services';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Service } from '@/types';
import ServiceCard from '@/components/ServiceCard';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';

export default function Index() {
  const [services, setServices] = useLocalStorage<Service[]>('services', initialServices);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');

  const filteredServices = services.filter(service => {
    const matchesCategory = categoryFilter ? service.category === categoryFilter : true;
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <AnimatedTransition animation="slide-down">
            <div>
              <h1 className="text-3xl font-bold">
                {categoryFilter || 'Todos os Serviços'}
              </h1>
              <p className="text-muted-foreground mt-1">
                Verifique a documentação necessária para serviços do DETRAN-PE
              </p>
            </div>
          </AnimatedTransition>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar serviço..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => navigate('/admin')} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Novo Serviço
            </Button>
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Nenhum serviço encontrado</h2>
            <p className="text-muted-foreground mt-1 max-w-md">
              {searchQuery
                ? `Não encontramos resultados para "${searchQuery}"`
                : 'Não há serviços cadastrados nesta categoria'}
            </p>
            <Button 
              variant="link" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                if (categoryFilter) {
                  navigate('/');
                }
              }}
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
