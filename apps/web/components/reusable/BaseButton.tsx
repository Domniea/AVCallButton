// "use client";

// import React from "react";
// import { Button as ChakraButton, Flex } from "@chakra-ui/react";
// import { useTheme } from "next-themes";


// type ButtonVariant = "primary" | "secondary" | "tertiary";

// interface BaseButtonProps {
//   title?: string;
//   variety?: ButtonVariant;
//   btnHeight?: number | string;
//   btnWidth?: number | string;
//   center?: boolean;
//   leftIcon?: React.ReactNode;
//   rightIcon?: React.ReactNode;
//   children?: React.ReactNode;
//   onClick?: () => void;
// }

// const variants = {
//   primary: {
//     bg: "buttonPrimaryBg",
//     fg: "buttonPrimaryFg",
//     pressed: "buttonPrimaryHoverBg",
//     border: "transparent",
//     borderWidth: 0,
//     shadow: "buttonPrimary",
//   },

//   secondary: {
//     bg: "transparent",                // ← Outline only
//     fg: "buttonSecondaryFg",
//     pressed: "buttonSecondaryHoverBg",
//     border: "buttonSecondaryBorder",  // ← Token border
//     borderWidth: 1,
//     shadow: "buttonSecondary",
//   },

//   tertiary: {
//     bg: "transparent",                // ← Text only
//     fg: "buttonTertiaryFg",
//     pressed: "buttonTertiaryHoverBg",
//     border: "transparent",            // ← No border
//     borderWidth: 0,
//     shadow: "buttonTertiary",         // ← Usually none
//   },
// };

// export const BaseButton: React.FC<BaseButtonProps> = ({
//   title,
//   variety = "primary",
//   btnWidth = "100%",
//   btnHeight,
//   center,
//   // leftIcon,
//   // rightIcon,
//   children,
//   onClick,
//   ...rest
// }) => {
//   const v = variants[variety];

//   console.log('test', useTheme())
//   return (
//     <Flex
//       w={btnWidth}
//       alignSelf={center ? "center" : undefined}
//       shadow={v.shadow}
//       borderRadius="xl"
//     >
//       <ChakraButton
//         w="100%"
//         h={btnHeight}
//         bg={v.bg}
//         color={v.fg}
//         borderWidth={v.borderWidth}
//         borderColor={v.border}
//         borderRadius="xl"
//         py={4}
//         px={6}
//         // leftIcon={leftIcon}
//         // rightIcon={rightIcon}
//         _hover={{ bg: v.pressed }}
//         _active={{ bg: v.pressed }}
//         onClick={onClick}
//         {...rest}
//       >
//         {children ?? title}
//       </ChakraButton>
//     </Flex>
//   );
// };


"use client";

import React from "react";
import { Button as ChakraButton, Flex } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";

type ButtonVariant = "primary" | "secondary" | "tertiary";

interface BaseButtonProps {
  title?: string;
  variety?: ButtonVariant;
  btnHeight?: number | string;
  btnWidth?: number | string;
  center?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
}

const variants = {
  primary: {
    bg: "buttonPrimaryBg",
    fg: "buttonPrimaryFg",
    hover: "buttonPrimaryHoverBg",
    border: "transparent",
    borderWidth: 0,
    shadow: {
      light: "buttonPrimary",
      dark: "buttonPrimaryDark",
    },
  },

  secondary: {
    bg: "buttonSecondaryBg",
    fg: "buttonSecondaryFg",
    hover: "buttonSecondaryHoverBg",
    border: "buttonSecondaryBorder",
    borderWidth: 1,
    shadow: {
      light: "buttonSecondary",
      dark: "buttonSecondaryDark",
    },
  },

  tertiary: {
    bg: "transparent",
    fg: "buttonTertiaryFg",
    hover: "buttonTertiaryHoverBg",
    border: "transparent",
    borderWidth: 0,
    shadow: {
      light: "buttonTertiary",
      dark: "buttonTertiaryDark",
    },
  },
};

export const BaseButton: React.FC<BaseButtonProps> = ({
  title,
  variety = "primary",
  btnWidth = "100%",
  btnHeight,
  center,
  // leftIcon,
  // rightIcon,
  children,
  onClick,
  ...rest
}) => {
  const v = variants[variety];

  const shadow = useColorModeValue(v.shadow.light, v.shadow.dark);

  return (
    <Flex
      w={btnWidth}
      alignSelf={center ? "center" : undefined}
      shadow={shadow}
      borderRadius="xl"
    >
      <ChakraButton
        w="100%"
        h={btnHeight}
        bg={v.bg}
        color={v.fg}
        borderWidth={v.borderWidth}
        borderColor={v.border}
        borderRadius="xl"
        py={4}
        px={6}
        _hover={{ bg: v.hover }}
        _active={{ bg: v.hover }}
        // leftIcon={leftIcon}
        // rightIcon={rightIcon}
        onClick={onClick}
        {...rest}
      >
        {children ?? title}
      </ChakraButton>
    </Flex>
  );
};
