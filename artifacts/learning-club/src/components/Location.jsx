import { ArrowRight, MapPin } from 'lucide-react';
import './Location.css';

/**
 * Google Maps embed with no API key.
 *
 * query: a place name, a full address, or "latitude,longitude"
 *        e.g. "Gandhi Chowk, Your City, India"  or  "20.9320,77.7523"
 */
export default function LocationMap({ query, label = 'Find us here', note }) {
  const q = encodeURIComponent(query);
  const embedSrc = `https://www.google.com/maps?q=${q}&output=embed`;
  const openHref = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${q}`;

  return (
    <section className="content-section location-map" aria-labelledby="location-heading">
      <h2 className="section-heading" id="location-heading">
        <MapPin size={24} aria-hidden="true" /> {label}
      </h2>
      {note && <p className="chalk-copy">{note}</p>}

      <div className="map-frame">
        <iframe
          title={`Map showing ${query}`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="map-actions">
        <a className="chalk-button" href={directionsHref} target="_blank" rel="noreferrer">
          Get directions <ArrowRight size={14} />
        </a>
        <a className="chalk-button outline" href={openHref} target="_blank" rel="noreferrer">
          Open in Google Maps
        </a>
      </div>
    </section>
  );
}
