import CentreCard from './CentreCard';
import { centres } from './centres-data';
import './Centres.css';

export default function Centres() {
  return (
    <section className="centres-wall" aria-label="Nirvana centres">
      {centres.map((centre) => (
        <CentreCard key={centre.id} centre={centre} />
      ))}
    </section>
  );
}
