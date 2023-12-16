import React, { useState, useEffect } from 'react';
import VideoPlayer from './videoPlayer';

const GridComponent = () => {
  const [copyDropdownValue, setCopyDropdownValue] = useState('1');
  const [gridItems, setGridItems] = useState([]);

  const handleDropdownChange = (selectedValue) => {
    setCopyDropdownValue(selectedValue);

    const numberOfItems = parseInt(selectedValue, 10);
    const items = Array.from({ length: numberOfItems }, (_, index) => <VideoPlayer key={index} />);

    setGridItems(items);
  };

  useEffect(() => {
    handleDropdownChange(copyDropdownValue);
  }, [copyDropdownValue]);

  return (
    <div>
      <label htmlFor="copy-dropdown">Select No of Player: </label>
      <select
        aria-placeholder="Select No of Player"
        id="copy-dropdown"
        value={copyDropdownValue}
        onChange={(e) => handleDropdownChange(e.target.value)}
      >
        {[1, 2, 3, 4].map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>

      <div
        id="grid-container"
        className="grid-container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
          padding: '5px',
        }}
      >
        {gridItems.map((item, index) => (
          <div
            key={index}
            className="grid-item"
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              textAlign: 'center',
              flexBasis: `calc(48% - 20px)`,
              width: '600px',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridComponent;
