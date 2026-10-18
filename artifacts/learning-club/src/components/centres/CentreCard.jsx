import { useState } from 'react';
import SchoolScene from './SchoolScene';

export default function CentreCard({ centre }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = centre.image && !imageFailed;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centre.location)}`;
  // const telHref = `tel:${centre.phone.replace(/[^\d+]/g, '')}`;

  return (
    <article className="polaroid" style={{ '--centre-color': centre.color, '--tilt': centre.tilt }}>
      <span className="polaroid-tape" aria-hidden="true" />

      <div className="polaroid-photo">
        {showPhoto ? (
          <img
            src={`${import.meta.env.BASE_URL}${centre.image}`}
            alt={`${centre.name} building and children`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <SchoolScene />
        )}
      </div>

      <h3 className="polaroid-name">{centre.name}</h3>
      <p className="polaroid-desc">{centre.description}</p>

      <dl className="polaroid-info">
        <dt>Head</dt>
        <dd>{centre.head}</dd>
        <dt>Find us</dt>
        <dd><a href={mapUrl} target="_blank" rel="noreferrer">{centre.location}</a></dd>
      </dl>
    </article>
  );
}
