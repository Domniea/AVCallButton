// // import React from "react";
// // import { Box, Button, IButtonProps, Text } from "native-base";

// // type ButtonVariant = "primary" | "secondary" | "tertiary";

// // interface BaseButtonProps extends IButtonProps {
// //   title?: string;
// //   variety?: ButtonVariant;
// //   btnHeight?: number | string;
// //   btnWidth?: number | string;
// //   center?: boolean;
// //   leftIcon?: React.ReactNode;
// //   rightIcon?: React.ReactNode;
// //   children?: React.ReactNode;
// // }

// // const variants = {
// //   primary: {
// //     bg: "button.primary.bg",
// //     fg: "button.primary.fg",
// //     pressed: "button.primary.hover-bg",
// //     border: "transparent",
// //     borderWidth: 0,
// //     shadow: "card",
// //   },
// //   secondary: {
// //     bg: "button.secondary.bg",
// //     fg: "button.secondary.fg",
// //     pressed: "button.secondary.hover-bg",
// //     border: "button.secondary.border",
// //     borderWidth: 1,
// //     shadow: "surface",
// //   },
// //   tertiary: {
// //     bg: "transparent",
// //     fg: "button.tertiary.fg",
// //     pressed: "button.tertiary.hover-bg",
// //     border: "transparent",
// //     borderWidth: 0,
// //     shadow: "none",
// //   },
// // };

// // export const BaseButton: React.FC<BaseButtonProps> = ({
// //   title,
// //   variety = "primary",
// //   btnHeight,
// //   btnWidth = "100%",
// //   center,
// //   leftIcon,
// //   rightIcon,
// //   children,
// //   ...rest
// // }) => {
// //   const v = variants[variety];

// //   return (
// //     <Box
// //       width={btnWidth}
// //       alignSelf={center ? "center" : undefined}
// //       shadow={v.shadow}     // ← shadow HERE, not on Button
// //       borderRadius="xl"
// //     >
// //       <Button
// //         width="100%"
// //         height={btnHeight}
// //         bg={v.bg}
// //         borderWidth={v.borderWidth}
// //         borderColor={v.border}
// //         borderRadius="xl"
// //         overflow="visible"
// //         py="4"
// //         px="6"
// //         _pressed={{ bg: v.pressed }}
// //         leftIcon={leftIcon}
// //         rightIcon={rightIcon}
// //         {...rest}
// //       >
// //         {children ? (
// //           children
// //         ) : (
// //           <Text fontFamily="heading" color={v.fg} fontSize="xl" textAlign="center">
// //             {title}
// //           </Text>
// //         )}
// //       </Button>
// //     </Box>
// //   );
// // };

// import React from "react";
// import { Pressable, Box, Text } from "native-base";

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
//   onPress?: () => void;
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
//     bg: "transparent",
//     fg: "buttonSecondaryFg",
//     pressed: "buttonSecondaryHoverBg",
//     border: "buttonSecondaryBorder",
//     borderWidth: 1,
//     shadow: "buttonSecondary",
//   },

//   tertiary: {
//     bg: "transparent",
//     fg: "buttonTertiaryFg",
//     pressed: "buttonTertiaryHoverBg",
//     border: "transparent",
//     borderWidth: 0,
//     shadow: "buttonTertiary",
//   },
// };

// export const BaseButton: React.FC<BaseButtonProps> = ({
//   title,
//   variety = "primary",
//   btnWidth = "100%",
//   btnHeight,
//   center,
//   leftIcon,
//   rightIcon,
//   children,
//   onPress,
//   ...rest
// }) => {
//   const v = variants[variety];

//   return (
//     <Box
//       width={btnWidth}
//       alignSelf={center ? "center" : undefined}
//       shadow={v.shadow}
//       borderRadius="xl"
//     >
//       <Pressable
//         onPress={onPress}
//         bg={v.bg}
//         borderWidth={v.borderWidth}
//         borderColor={v.border}
//         borderRadius="xl"
//         py="4"
//         px="6"
//         height={btnHeight}
//         _pressed={{ bg: v.pressed }}
//         flexDirection="row"
//         alignItems="center"
//         justifyContent="center"
//         {...rest}
//       >
//         {leftIcon}

//         <Text
//           color={v.fg}
//           fontFamily="heading"
//           fontSize="xl"
//           textAlign="center"
//           mx={leftIcon || rightIcon ? 2 : 0}
//         >
//           {children ?? title}
//         </Text>

//         {rightIcon}
//       </Pressable>
//     </Box>
//   );
// };



import React from "react";
import { Pressable, Box, Text, useColorModeValue } from "native-base";

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
  onPress?: () => void;
}

export const BaseButton: React.FC<BaseButtonProps> = ({
  title,
  variety = "primary",
  btnWidth = "100%",
  btnHeight,
  center,
  leftIcon,
  rightIcon,
  children,
  onPress,
  ...rest
}) => {

  //
  // === COLOR + SHADOW RESOLUTION (Semantic Tokens) ===
  //
  const bg = useColorModeValue(
    `${variety === "primary" ? "buttonPrimaryBg" :
      variety === "secondary" ? "buttonSecondaryBg" :
      "transparent"}`, // tertiary
    `${variety === "primary" ? "buttonPrimaryBgDark" :
      variety === "secondary" ? "buttonSecondaryBgDark" :
      "transparent"}`
  );

  const fg = useColorModeValue(
    variety === "primary"
      ? "buttonPrimaryFg"
      : variety === "secondary"
      ? "buttonSecondaryFg"
      : "buttonTertiaryFg",
    variety === "primary"
      ? "buttonPrimaryFgDark"
      : variety === "secondary"
      ? "buttonSecondaryFgDark"
      : "buttonTertiaryFgDark"
  );

  const pressedBg = useColorModeValue(
    variety === "primary"
      ? "buttonPrimaryHoverBg"
      : variety === "secondary"
      ? "buttonSecondaryHoverBg"
      : "buttonTertiaryHoverBg",
    variety === "primary"
      ? "buttonPrimaryHoverBgDark"
      : variety === "secondary"
      ? "buttonSecondaryHoverBgDark"
      : "buttonTertiaryHoverBgDark"
  );

  //
  // === SHADOW LOOKUP ===
  // (native-base merges `shadow="buttonPrimary"` onto the wrapper Box)
  //
  const shadowName = useColorModeValue(
    variety === "primary"
      ? "buttonPrimary"
      : variety === "secondary"
      ? "buttonSecondary"
      : "buttonTertiary",
    variety === "primary"
      ? "buttonPrimaryDark"
      : variety === "secondary"
      ? "buttonSecondaryDark"
      : "buttonTertiaryDark"
  );

  //
  // === BORDER TOKEN ===
  //
  const borderColor = useColorModeValue(
    variety === "secondary" ? "buttonSecondaryBorder" : "transparent",
    variety === "secondary" ? "buttonSecondaryBorderDark" : "transparent"
  );

  const borderWidth = variety === "secondary" ? 1 : 0;

  return (
    <Box
      width={btnWidth}
      alignSelf={center ? "center" : undefined}
      shadow={shadowName}
      borderRadius="xl"
    >
      <Pressable
        onPress={onPress}
        bg={bg}
        borderColor={borderColor}
        borderWidth={borderWidth}
        borderRadius="xl"
        py="4"
        px="6"
        height={btnHeight}
        _pressed={{ bg: pressedBg }}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        {...rest}
      >
        {leftIcon}

        <Text
          color={fg}
          fontFamily="heading"
          fontSize="xl"
          textAlign="center"
          mx={leftIcon || rightIcon ? 2 : 0}
        >
          {children ?? title}
        </Text>

        {rightIcon}
      </Pressable>
    </Box>
  );
};
