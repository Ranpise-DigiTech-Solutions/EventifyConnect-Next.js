import React from 'react'

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Photo from '@mui/icons-material/Photo';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Pagination from '@mui/material/Pagination';
import { Box } from '@mui/system';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Captions, Fullscreen, Thumbnails, Zoom } from 'yet-another-react-lightbox/plugins';

import { GalleryPhotoSlides, GalleryAlbumSlides, GalleryVideos } from '@/lib/constants';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import styles from './gallery.module.scss';

type Props = {}

const GalleryComponent = (props: Props) => {
    
  const [value, setValue] = React.useState<number>(0);
  const [index, setIndex] = React.useState<number>(-1);
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 6;

  const handleChange = (event : React.SyntheticEvent, newValue : number) => {
    setValue(newValue);
  };

  const handleClickImage = (currentIndex : number) => {
    setIndex(currentIndex);
  };

  const handlePaginationChange = (event : React.ChangeEvent<unknown>, value : number) => {
    setPage(value);
  };

  const renderImages = (slides : Array<{ src: string, title: string, description: string }>) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return slides.slice(startIndex, endIndex).map((slide, idx) => (
      <div
        onClick={() => handleClickImage(startIndex + idx)}
        key={startIndex + idx}
        className={styles.image}
      >
        <img src={slide.src} alt={slide.description} />
      </div>
    ));
  };

  const renderVideos = (videos: Array<{ src: string, title: string, description: string }>) => {
    return videos.map((video, idx) => (
      <div
        onClick={() => handleClickImage(idx)} // Assuming you want to open video in lightbox
        key={idx}
        className={styles.video}
      >
        {/* Render your video component here */}
        <video controls>
          <source src={video.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    ));
  };

  return (
    <div className={styles.gallery__container}>
      <div className={styles.gallery}>
      <Tabs
      value={value}
      onChange={handleChange}
      aria-label="icon label tabs example"
      TabIndicatorProps={{
        style: {
          display: 'none',  // Hide the default tab indicator
        },
      }}
      sx={{
        '.MuiTabs-flexContainer': {
          justifyContent: 'flex-end',  // Align tabs to the right
          backgroundColor: "orange",
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
        },
        '.Mui-selected': {
          color: 'white',  // Change the color of the selected tab
        },
      }}
    >
      <Tab
        icon={<Photo />}
        label="PHOTOS"
        value={0}  // The value of this tab
        sx={{
          color: value === 0 ? 'white' : '',  // Style for the active tab
        }}
      />
      <Tab
        icon={<PhotoLibraryIcon />}
        label="ALBUMS"
        value={1}  // The value of this tab
        sx={{
          color: value === 1 ? 'white' : '',  // Style for the active tab
        }}
      />
      <Tab
        icon={<YouTubeIcon />}
        label="VIDEOS"
        value={2}  // The value of this tab
        sx={{
          color: value === 2 ? 'white' : '',  // Style for the active tab
        }}
      />
    </Tabs>
        <div className={styles.Photos}>
          {value === 0 ? (
            <div className={`${styles.imageBox} ${value === 0 ? '' : styles['blur-background']}`}>
              <div className={styles['images-container']}>
                {renderImages(GalleryPhotoSlides)}
              </div>
              <Lightbox
                plugins={[Captions, Fullscreen, Zoom, Thumbnails]}
                captions={{
                  showToggle: true,
                  descriptionTextAlign: 'end',
                }}
                index={index}
                open={index >= 0}
                close={() => setIndex(-1)}
                slides={GalleryPhotoSlides} // Pass slides data to Lightbox
              />
            </div>
          ) : null}
          {value === 1 ? (
            <div className={`${styles.imageBox} ${value === 1 ? '' : styles['blur-background']}`}>
              <div className={styles['images-container']}>
                {renderImages(GalleryAlbumSlides)} {/* Render images from Album component */}
              </div>
              <Lightbox
                plugins={[Captions, Fullscreen, Zoom, Thumbnails]}
                captions={{
                  showToggle: true,
                  descriptionTextAlign: 'end',
                }}
                index={index}
                open={index >= 0}
                close={() => setIndex(-1)}
                slides={GalleryAlbumSlides} // Pass slides data from Album component to Lightbox
              />
            </div>
          ) : null}
          {value === 2 ? (
            <div className={`${styles.imageBox} ${value === 2 ? '' : styles['blur-background']}`}>
              <div className={styles['videos-container']}>
                {renderVideos(GalleryVideos)}
              </div>
            </div>
          ) : null}
          <Box display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(GalleryPhotoSlides.length / itemsPerPage)}
              page={page}
              onChange={handlePaginationChange}
            />
          </Box>
        </div>
      </div>
    </div>
  );

}

export default GalleryComponent