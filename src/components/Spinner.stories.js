import { fn } from "@storybook/test";

import Spinner from "./Spinner";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: "Example/Components/Spinner",
  component: Spinner,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    borderColor: { control: "color" },
    animationTime: { control: "text" },
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary = {
  args: { borderColor: "#c2c2c2" },
};

export const BorderRed = {
  args: {
    borderColor: "red",
    animationTime: "2s",
  },
};
