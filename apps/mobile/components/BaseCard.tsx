// import React from "react";
// import { Box, Text, IBoxProps, useColorModeValue } from "native-base";

// type TitleAlign = "start" | "center" | "end";

// interface BaseCardProps extends IBoxProps {
//   title?: string;
//   titleAlign?: TitleAlign;
//   variant?: "default" | "surface" | "elevated" | "outline";
// }

// const cardVariants = {
//   default: {
//     bg: ["cardBg", "cardBgDark"],
//     border: ["transparent", "transparent"],
//     borderWidth: 0,
//     shadow: ["card", "cardDark"],
//   },

//   surface: {
//     bg: ["surface", "surfaceDark"],
//     border: ["transparent", "transparent"],
//     borderWidth: 0,
//     shadow: ["surface", "surfaceDark"],
//   },

//   elevated: {
//     bg: ["surfaceElevated", "surfaceElevatedDark"],
//     border: ["transparent", "transparent"],
//     borderWidth: 0,
//     shadow: ["outer", "outerDark"],
//   },

//   outline: {
//     bg: ["surface", "surfaceDark"],
//     border: ["cardBorder", "cardBorderDark"],
//     borderWidth: 1,
//     shadow: ["subtle", "subtleDark"],
//   },
// };

// export const BaseCard: React.FC<BaseCardProps> = ({
//   title,
//   titleAlign = "center",
//   variant = "default",
//   children,
//   ...rest
// }) => {
//   const v = cardVariants[variant];

//   const bg = useColorModeValue(v.bg[0], v.bg[1]);
//   const shadow = useColorModeValue(v.shadow[0], v.shadow[1]);
//   const borderColor = useColorModeValue(v.border[0], v.border[1]);

//   return (
//     <Box
//       bg={bg}
//       shadow={shadow}
//       borderRadius="xl"
//       borderWidth={v.borderWidth}
//       borderColor={borderColor}
//       p={6}
//       overflow="visible"
//       {...rest}
//     >
//       {title && (
//         <Text
//           fontFamily="heading"
//           fontSize="lg"
//           textAlign={titleAlign}
//           mb={3}
//           color={useColorModeValue("text", "textDark")}
//         >
//           {title}
//         </Text>
//       )}

//       {children}
//     </Box>
//   );
// };



import React from "react";
import { Box, Text, IBoxProps, useColorModeValue } from "native-base";

type TitleAlign = "start" | "center" | "end";

interface BaseCardProps extends IBoxProps {
  title?: string;
  titleAlign?: TitleAlign;
  variant?: "default" | "surface" | "elevated" | "outline";
}

const cardVariants = {
  default: {
    bg: ["cardBg", "cardBgDark"],
    fg: ["text", "textDark"],             // ← NEW
    border: ["transparent", "transparent"],
    borderWidth: 0,
    shadow: ["card", "cardDark"],
  },

  surface: {
    bg: ["surface", "surfaceDark"],
    fg: ["text", "textDark"],             // ← NEW
    border: ["transparent", "transparent"],
    borderWidth: 0,
    shadow: ["surface", "surfaceDark"],
  },

  elevated: {
    bg: ["surfaceElevated", "surfaceElevatedDark"],
    fg: ["text", "textDark"],             // ← NEW
    border: ["transparent", "transparent"],
    borderWidth: 0,
    shadow: ["outer", "outerDark"],
  },

  outline: {
    bg: ["surface", "surfaceDark"],
    fg: ["text", "textDark"],             // ← NEW
    border: ["cardBorder", "cardBorderDark"],
    borderWidth: 1,
    shadow: ["subtle", "subtleDark"],
  },
};

export const BaseCard: React.FC<BaseCardProps> = ({
  title,
  titleAlign = "center",
  variant = "default",
  children,
  ...rest
}) => {
  const v = cardVariants[variant];

  const bg = useColorModeValue(v.bg[0], v.bg[1]);
  const fg = useColorModeValue(v.fg[0], v.fg[1]);          // ← NEW
  const shadow = useColorModeValue(v.shadow[0], v.shadow[1]);
  const borderColor = useColorModeValue(v.border[0], v.border[1]);

  return (
    <Box
      bg={bg}
      shadow={shadow}
      borderRadius="xl"
      borderWidth={v.borderWidth}
      borderColor={borderColor}
      p={6}
      overflow="visible"
      {...rest}
    >
      {title && (
        <Text
          fontFamily="heading"
          fontSize="lg"
          textAlign={titleAlign}
          mb={3}
          color={fg}                          // ← USE fg HERE
        >
          {title}
        </Text>
      )}

      {children}
    </Box>
  );
};
