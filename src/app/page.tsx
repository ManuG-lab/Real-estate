import { properties } from '@/lib/data';
import { PropertyCard } from '@/components/property-card';
import { PropertyFilters } from '@/components/property-filters';
import { AiSuggester } from '@/components/ai-suggester';

export default function Home() {
  const availableProperties = properties.filter(
    (p) => p.availability === 'available'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 rounded-lg bg-card p-8 text-center shadow-lg">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Find Your Next Home
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Discover the perfect rental property that fits your lifestyle and
          budget.
        </p>
        <div className="mt-6">
          <AiSuggester />
        </div>
      </section>

      <section className="mb-8">
        <PropertyFilters />
      </section>

      <section>
        <h2 className="font-headline text-3xl font-semibold mb-6">
          Available Rentals
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {availableProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </div>
  );
}
