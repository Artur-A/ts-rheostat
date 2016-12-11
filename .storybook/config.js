import { configure } from '@kadira/storybook';

function loadStories() {
  require('../stories/ExampleSlider.tsx');
}

configure(loadStories, module);
