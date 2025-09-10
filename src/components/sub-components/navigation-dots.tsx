import React, { memo } from 'react';

type Props = {
    active: number,
    imageList: Array<any>,
    className: string
}

const NavigationDots = ({ active, imageList, className }: Props) => {
    // The component is now memoized, so this code only runs when props change
    
    // Check if imageList is a valid array with elements
    if (!imageList || imageList.length === 0) {
      return null;
    }

    return (
        <div>
          <div className="app__navigation">
            {imageList.map((_, index) => (
                <div
                    key={`dot-${index}`}
                    className={className}
                    style={active === index ? { backgroundColor: `#313bac` } : {}}
                />
            ))}
          </div>
        </div>
    );
}

export default memo(NavigationDots);