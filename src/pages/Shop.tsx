import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipReveal, PopIn, RevealText } from '@/components/motion';

// Import product images
const tshirtsImage = '/placeholder.svg';

// Sample products data
const products = [
  {
    id: 1,
    name: 'Made to Worship T-Shirt',
    nameGr: 'Made to Worship T-Shirt',
    price: 25,
    colors: ['Black', 'White', 'Gray', 'Beige'],
    colorsGr: ['Μαύρο', 'Λευκό', 'Γκρι', 'Μπεζ'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: 'in_stock',
    image: tshirtsImage,
    description: 'John 4:23 - The true worshipers will worship the Father in spirit and truth.',
    descriptionGr: 'Ιωάννης 4:23 - Οι αληθινοί προσκυνητές θα προσκυνήσουν τον Πατέρα εν πνεύματι και αληθεία.',
  },
];

const Shop = () => {
  const { t, i18n } = useTranslation();

  const getStockBadge = (stock: string) => {
    switch (stock) {
      case 'in_stock':
        return <Badge className="bg-primary text-primary-foreground">{t('shop.in_stock')}</Badge>;
      case 'few_left':
        return <Badge className="bg-accent text-accent-foreground">{t('shop.few_left')}</Badge>;
      case 'out_of_stock':
        return <Badge variant="secondary">{t('shop.out_of_stock')}</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      {/* Hero with T-shirt Image */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={tshirtsImage}
            alt="Made to Worship Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <PopIn trigger="mount" className="mb-6">
            <ShoppingBag className="h-16 w-16 text-primary" />
          </PopIn>
          <RevealText
            as="h1"
            trigger="mount"
            text={t('shop.title')}
            delay={0.15}
            className="font-display text-[42px] md:text-[62px] font-bold mb-6"
          />
          <RevealText
            as="p"
            split={false}
            trigger="mount"
            text={t('shop.collection_subtitle')}
            delay={0.45}
            className="text-xl text-white/80"
          />
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {products.map((product, index) => (
              <ClipReveal key={product.id}>
                <Card className="overflow-hidden border-0 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Product Image */}
                    <div className="aspect-square md:aspect-auto overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <CardContent className="p-8 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-display font-semibold text-[26px] md:text-[30px]">
                          {product.name}
                        </h3>
                        {getStockBadge(product.stock)}
                      </div>
                      
                      <p className="text-muted-foreground mb-6 italic">
                        {i18n.language === 'gr' ? product.descriptionGr : product.description}
                      </p>
                      
                      <p className="text-3xl font-bold text-primary mb-6">
                        €{product.price}
                      </p>
                      
                      <div className="space-y-4 mb-8">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">{t('shop.color')}: </span>
                          <span className="text-sm">
                            {i18n.language === 'gr' 
                              ? product.colorsGr.join(', ')
                              : product.colors.join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">{t('shop.size')}: </span>
                          <span className="text-sm">{product.sizes.join(', ')}</span>
                        </div>
                      </div>
                      
                      <Button 
                        size="lg"
                        className="btn-fill w-full text-lg py-6" 
                        disabled={product.stock === 'out_of_stock'}
                      >
                        {t('shop.buy_now')}
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </ClipReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Note */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            {t('shop.coming_soon')}
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
