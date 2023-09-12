/*
  General types for general uses
*/

import type { NextSeoProps } from "next-seo";

/**
 * Default props for all layouts
 */
export type SimpleLayoutProps = {
  children: React.ReactNode;
  seo?: NextSeoProps;
  className?: string;

  /**
   * Single component containing Dialog components to be included within the layout
   */
  dialogs?: React.ReactNode;
};
