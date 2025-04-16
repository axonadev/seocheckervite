import { Box } from "@mui/system";
import PropTypes from "prop-types";

const Spinner = ({
  sx = {},
  animationTime = "1s",
  borderColor = "secondary.main",
}) => {
  return (
    <Box
      sx={{
        width: "50px",
        height: "50px",
        border: "8px solid #000",
        borderColor: borderColor,
        borderTop: "8px solid",
        borderTopColor: "primary.main",
        borderRadius: "50%",
        animation: "spin " + animationTime + " linear infinite",
        "@keyframes spin": {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg)",
          },
        },
        ...sx,
      }}
    />
  );
};

Spinner.propTypes = {
  animationTime: PropTypes.string,
  borderColor: PropTypes.string,
  sx: PropTypes.array,
};

Spinner.defaultProps = {
  animationTime: "1s",
  borderColor: "secondary.main",
  sx: {},
};

export default Spinner;
