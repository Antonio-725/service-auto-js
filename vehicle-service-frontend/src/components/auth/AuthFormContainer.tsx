import { Box, Card, CardContent, Typography } from "@mui/material";
import { type ReactNode } from "react";

interface AuthFormContainerProps {
  title: string;
  children: ReactNode;
}

const AuthFormContainer = ({ title, children }: AuthFormContainerProps) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f4f6f8 100%)", // Subtle gradient
        padding: { xs: 2, sm: 4 },
      }}
      role="main"
    >
      <Card
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 450,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)", // Softer shadow
          backgroundColor: "#ffffff",
        }}
        aria-labelledby="auth-form-title"
      >
        <CardContent>
          <Typography
            id="auth-form-title"
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "#1a237e",
              mb: 3,
            }}
          >
            {title}
          </Typography>
          {children}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthFormContainer;