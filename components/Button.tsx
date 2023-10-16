import clsx from 'clsx'
import { FunctionComponent, PropsWithChildren } from 'react'
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text
} from 'react-native'

interface ButtonProps extends PropsWithChildren<PressableProps> {
  isDisabled?: boolean
  isLoading?: boolean
}

const Button: FunctionComponent<ButtonProps> = ({
  isDisabled = false,
  isLoading = false,
  children,
  className,
  ...rest
}) => (
  <Pressable
    {...rest}
    disabled={isDisabled || isLoading}
    className={clsx(
      className,
      {
        'opacity-40': isDisabled || isLoading
      },
      'h-12 w-full items-center justify-center rounded-xl bg-apple-blue-light active:opacity-90'
    )}
  >
    {isLoading ? (
      <ActivityIndicator color="white" />
    ) : (
      <Text className="font-Poppins_600SemiBold text-white">{children}</Text>
    )}
  </Pressable>
)

export default Button
