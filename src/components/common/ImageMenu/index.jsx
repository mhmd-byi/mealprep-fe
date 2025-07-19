import { useState } from "react";
import { Gallery } from "react-grid-gallery";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export const ImageMenu = ({ images, handleDelete, currentDate }) => {
  const [index, setIndex] = useState(-1);

  const handleClick = (index, item) => setIndex(index);
  if (!images) return null;
  const slides = images.map(({ src }) => ({
    src,
  }));
  const handleOnSelect = (index, item) => {
    handleDelete(item.src, currentDate)
  }
  return (
    <div>
      <Gallery 
        images={images}
        onClick={handleClick}
        enableImageSelection={true}
        onSelect={handleOnSelect}
      />
      <Lightbox
        slides={slides}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
      />
    </div>
  );
};

export const ImageMenuForUser = ({ images }) => {
  const [index, setIndex] = useState(-1);

  const handleClick = (index, item) => setIndex(index);
  if (!images) return null;
  const slides = images.map(({ src }) => ({
    src,
  }));
  return (
    <div>
      <Gallery 
        images={images}
        onClick={handleClick}
        enableImageSelection={false}
        tileViewportStyle={{ borderRadius: '10px', overflow: 'hidden', columnGap: '25px' }}
      />
      <Lightbox
        slides={slides}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
      />
    </div>
  );
};
