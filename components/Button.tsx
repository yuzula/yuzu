import clsx from 'clsx'
import { FunctionComponent, PropsWithChildren } from 'react'
import { Pressable, PressableProps, Text } from 'react-native'

interface ButtonProps extends PropsWithChildren<PressableProps> {
  isDisabled?: boolean
}

const Button: FunctionComponent<ButtonProps> = ({
  isDisabled = false,
  children,
  className,
  ...rest
}) => (
  <Pressable
    {...rest}
    disabled={isDisabled}
    className={clsx(
      className,
      {
        'opacity-40': isDisabled
      },
      'w-full items-center justify-center rounded-xl bg-apple-blue-light p-3.5 active:opacity-90'
    )}
  >
    <Text className="font-Poppins_600SemiBold text-white">{children}</Text>
  </Pressable>
)

export default Button
