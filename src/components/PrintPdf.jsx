import React from "react";
import { Document, Page, pdf } from "@react-pdf/renderer";
import { Button, Container, Typography, Box } from "@mui/material";

const PrintPdf = ({ children }) => {
  // Genera il PDF come stringa Base64
  const generatePDFBase64 = async () => {
    const doc = (
      <Document>
        <Page size="A4" style={{ padding: 20 }}>
          {children}
        </Page>
      </Document>
    );
    const pdfBlob = await pdf(doc).toBlob();

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.pdf";
    a.click();
    URL.revokeObjectURL(url);

    const base64PDF = await convertBlobToBase64(pdfBlob);
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result contiene il Base64, rimuoviamo la parte iniziale "data:..." e restituiamo solo il Base64
        resolve(reader.result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Legge il blob come Data URL
    });
  };

  return (
    <>
      <Button onClick={() => generatePDFBase64()}>Apri</Button>
      <Container>
        {React.Children.map(children, (child) => renderChild(child, 0))}
      </Container>
    </>
  );

  function renderChild(child, level) {
    if (level > 5) return child;

    if (child.type === "Text" || child.type === "TEXT") {
      return (
        <Typography sx={child.props.style}>{child.props.children}</Typography>
      );
    }
    if (child.type === "Image" || child.type === "IMAGE") {
      return <img src={`${child.props.src}`} style={child.props.style} />;
    }
    if (child.type === "View" || child.type === "VIEW") {
      return (
        <Box sx={child.props.style}>
          {React.Children.map(child.props.children, (nestedChild) =>
            renderChild(nestedChild, level + 1)
          )}
        </Box>
      );
    }
    return child;
  }
};

export default PrintPdf;
