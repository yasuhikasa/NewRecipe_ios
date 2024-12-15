import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

const useDeviceOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height,
  );
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width,
  );

  useEffect(() => {
    const handleDimensionsChange = ({
      window,
    }: {
      window: { width: number; height: number };
    }) => {
      setIsLandscape(window.width > window.height);
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener(
      'change',
      handleDimensionsChange,
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return { isLandscape, isLargeScreen: screenWidth > 768, screenWidth };
};

export default useDeviceOrientation;
