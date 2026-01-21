import Hero from '../components/Hero/Hero';
import FoodCategories from '../components/FoodCategories/FoodCategories';
import InfoSection from '../components/InfoSection/InfoSection';
import AppPromo from '../components/AppPromo/AppPromo';

const HomePage = () => {
    return (
        <main>
            <Hero />
            <FoodCategories />
            <InfoSection />
            <AppPromo />
        </main>
    );
};

export default HomePage;
