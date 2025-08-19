import React, { useEffect } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Box } from "../ui";

interface CustomInputRangeSliderProps {
  value: [number, number];
  onChange: (range: [number, number]) => void;
  min?: number;
  max?: number;
}

const DEFAULT_MIN = 18;
const DEFAULT_MAX = 118;
const THUMB_SIZE = 32;
const TRACK_HEIGHT = 4;
const TRACK_COLOR = "#E3F3FA";
const FILLED_COLOR = "#2EC4F1";

const CustomInputRangeSlider: React.FC<CustomInputRangeSliderProps> = ({
  value,
  onChange,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
}) => {
  const [trackWidth, setTrackWidth] = React.useState(0);
  const [internalRange, setInternalRange] = React.useState<[number, number]>(value);

  // Sync internal state with prop
  useEffect(() => {
    setInternalRange(value);
  }, [value[0], value[1]]);

  // Shared values for thumb positions
  const leftThumbX = useSharedValue(0);
  const rightThumbX = useSharedValue(0);

  // Map value to position in px
  const valueToPosition = (val: number) => {
    if (max === min) return 0;
    return ((val - min) / (max - min)) * (trackWidth - THUMB_SIZE);
  };

  // Map px to value
  const positionToValue = (pos: number) => {
    if (trackWidth <= THUMB_SIZE) return min;
    const ratio = pos / (trackWidth - THUMB_SIZE);
    return Math.round(ratio * (max - min) + min);
  };

  // Sync thumbs with internal state
  useEffect(() => {
    if (trackWidth > 0) {
      leftThumbX.value = valueToPosition(internalRange[0]);
      rightThumbX.value = valueToPosition(internalRange[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalRange, trackWidth, min, max]);

  // Gesture handlers (all math inside worklet)
  const leftGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number; trackWidth: number; min: number; max: number; rightX: number }>({
    onStart: (_, ctx) => {
      ctx.startX = leftThumbX.value;
      ctx.trackWidth = trackWidth;
      ctx.min = min;
      ctx.max = max;
      ctx.rightX = rightThumbX.value;
    },
    onActive: (event, ctx) => {
      let newX = ctx.startX + event.translationX;
      newX = Math.max(0, Math.min(newX, ctx.rightX - THUMB_SIZE));
      leftThumbX.value = newX;

      // Map px to value (all math in worklet)
      let ratioL = newX / (ctx.trackWidth - THUMB_SIZE);
      let ratioR = ctx.rightX / (ctx.trackWidth - THUMB_SIZE);
      let newValL = Math.round(ratioL * (ctx.max - ctx.min) + ctx.min);
      let newValR = Math.round(ratioR * (ctx.max - ctx.min) + ctx.min);

      runOnJS(setInternalRange)([newValL, newValR]);
    },
    onEnd: (_, ctx) => {
      let ratioL = leftThumbX.value / (ctx.trackWidth - THUMB_SIZE);
      let ratioR = ctx.rightX / (ctx.trackWidth - THUMB_SIZE);
      let newValL = Math.round(ratioL * (ctx.max - ctx.min) + ctx.min);
      let newValR = Math.round(ratioR * (ctx.max - ctx.min) + ctx.min);
      runOnJS(onChange)([newValL, newValR]);
    },
  });

  const rightGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number; trackWidth: number; min: number; max: number; leftX: number }>({
    onStart: (_, ctx) => {
      ctx.startX = rightThumbX.value;
      ctx.trackWidth = trackWidth;
      ctx.min = min;
      ctx.max = max;
      ctx.leftX = leftThumbX.value;
    },
    onActive: (event, ctx) => {
      let newX = ctx.startX + event.translationX;
      newX = Math.max(ctx.leftX + THUMB_SIZE, Math.min(newX, ctx.trackWidth - THUMB_SIZE));
      rightThumbX.value = newX;

      // Map px to value (all math in worklet)
      let ratioL = ctx.leftX / (ctx.trackWidth - THUMB_SIZE);
      let ratioR = newX / (ctx.trackWidth - THUMB_SIZE);
      let newValL = Math.round(ratioL * (ctx.max - ctx.min) + ctx.min);
      let newValR = Math.round(ratioR * (ctx.max - ctx.min) + ctx.min);

      runOnJS(setInternalRange)([newValL, newValR]);
    },
    onEnd: (_, ctx) => {
      let ratioL = ctx.leftX / (ctx.trackWidth - THUMB_SIZE);
      let ratioR = rightThumbX.value / (ctx.trackWidth - THUMB_SIZE);
      let newValL = Math.round(ratioL * (ctx.max - ctx.min) + ctx.min);
      let newValR = Math.round(ratioR * (ctx.max - ctx.min) + ctx.min);
      runOnJS(onChange)([newValL, newValR]);
    },
  });

  // Animated styles
  const leftThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftThumbX.value }],
  }));
  const rightThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightThumbX.value }],
  }));
  const filledTrackStyle = useAnimatedStyle(() => ({
    left: leftThumbX.value + THUMB_SIZE / 2,
    width: rightThumbX.value - leftThumbX.value,
  }));

  // Layout handler to get track width
  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <Box className="w-full mt-5">
      <View style={styles.sliderContainer}>
        <View
          style={styles.track}
          onLayout={onTrackLayout}
          pointerEvents="box-none"
        >
          {/* Filled Track */}
          <Animated.View style={[styles.filledTrack, filledTrackStyle]} />
          {/* Left Thumb */}
          <PanGestureHandler onGestureEvent={leftGesture}>
            <Animated.View style={[styles.thumb, leftThumbStyle]} />
          </PanGestureHandler>
          {/* Right Thumb */}
          <PanGestureHandler onGestureEvent={rightGesture}>
            <Animated.View style={[styles.thumb, rightThumbStyle]} />
          </PanGestureHandler>
        </View>
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    width: "100%",
    maxWidth: 400,
    minWidth: 250,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    overflow: "visible",
  },
  track: {
    width: "100%",
    height: TRACK_HEIGHT,
    backgroundColor: TRACK_COLOR,
    borderRadius: TRACK_HEIGHT / 2,
    position: "relative",
    marginVertical: 16,
  },
  filledTrack: {
    position: "absolute",
    height: TRACK_HEIGHT,
    backgroundColor: FILLED_COLOR,
    borderRadius: TRACK_HEIGHT / 2,
    top: 0,
  },
  thumb: {
    position: "absolute",
    top: -(THUMB_SIZE - TRACK_HEIGHT) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E3F3FA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
});

export default CustomInputRangeSlider;
