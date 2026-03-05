import { useWebHaptics } from "web-haptics/react";
import { HAPTIC_CONFIGS } from "./haptics";

export const useAppHaptics = () => {
  const { trigger } = useWebHaptics({
    options: {
      enableVibrations: true,
      enableAudio: true,
    },
  });

  return {
    triggerError: () =>
      trigger(HAPTIC_CONFIGS.ERROR.pattern, HAPTIC_CONFIGS.ERROR.options),
    triggerClick: () =>
      trigger(HAPTIC_CONFIGS.CLICK.pattern, HAPTIC_CONFIGS.CLICK.options),
    triggerSelection: () =>
      trigger(
        HAPTIC_CONFIGS.SELECTION.pattern,
        HAPTIC_CONFIGS.SELECTION.options,
      ),
    trigger,
  };
};
