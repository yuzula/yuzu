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
  variant?: 'primary' | 'secondary'
}

const Button: FunctionComponent<ButtonProps> = ({
  isDisabled = false,
  isLoading = false,
  variant = 'primary',
  children,
  className,
  ...rest
}) => (
  <Pressable
    {...rest}
    disabled={isDisabled || isLoading}
    className={clsx(
      {
        'opacity-40': isDisabled || isLoading,
        'bg-primary': variant === 'primary',
        'bg-gray-100 active:bg-gray-200': variant === 'secondary'
      },
      'h-12 w-full items-center justify-center rounded-xl active:opacity-90',
      className
    )}
  >
    {isLoading ? (
      <ActivityIndicator color="white" />
    ) : (
      <Text
        className={clsx(
          {
            'text-black': variant === 'primary',
            'text-gray-600': variant === 'secondary'
          },
          'font-Poppins_600SemiBold'
        )}
      >
        {children}
      </Text>
    )}
  </Pressable>
)

export default Button
