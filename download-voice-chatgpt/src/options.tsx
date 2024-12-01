import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Options = () => {
  return (
    <>
      <div>
        <h6> Written by Arya Narcilia</h6>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
