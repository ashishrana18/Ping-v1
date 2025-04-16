import React from "react";

function NoPageFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        fontFamily: "sans-serif"
      }}
    >
      <h1 style={{ fontSize: "4em", color: "#ff6b6b", marginBottom: "10px" }}>
        404
      </h1>
      <p
        style={{
          fontSize: "1.5em",
          color: "#555",
          marginBottom: "20px",
          textAlign: "center"
        }}
      >
        Oops! The page you were looking for could not be found.
      </p>
      <p style={{ marginTop: "20px", color: "#777", fontSize: "0.9em" }}>
        You can also try navigating to the{" "}
        <a href="/" style={{ color: "#007bff" }}>
          homepage
        </a>
        .
      </p>
    </div>
  );
}

export default NoPageFound;
