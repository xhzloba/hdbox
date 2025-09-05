'use client'

import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp"
import { Lock, AlertCircle, CheckCircle, Shield, ShieldOff } from "lucide-react"
import { useParentalControl } from "../contexts/ParentalControlContext"
import { useToast } from "../../hooks/use-toast"

const AdultContentDialog = ({ isOpen, onClose, movie, onAccessGranted, setupMode = false, disableMode = false, onPinSetup, onPinDisable }) => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  // Безопасное использование useParentalControl с проверкой контекста
  let validatePin = () => false;
  let enableParentalControl = () => false;
  let disableParentalControl = () => false;
  let addUnlockedMovie = () => {};
  
  try {
    const parentalControl = useParentalControl();
    validatePin = parentalControl.validatePin;
    enableParentalControl = parentalControl.enableParentalControl;
    disableParentalControl = parentalControl.disableParentalControl;
    addUnlockedMovie = parentalControl.addUnlockedMovie;
  } catch (error) {
    // Контекст недоступен, используем значения по умолчанию
    console.warn('ParentalControlContext not available, using defaults');
  }
  const { toast } = useToast()

  const handlePinComplete = (value) => {
    setPin(value)
    // Очищаем ошибку при изменении PIN-кода
    if (error) {
      setError('')
    }
  }

  const handleConfirm = () => {
    if (pin.length !== 4) {
      setError('Введите 4-значный PIN-код')
      return
    }

    if (setupMode) {
      // Режим установки PIN-кода
      const success = enableParentalControl(pin)
      if (success) {
        toast({
          title: "Родительский контроль включен",
          description: "PIN-код установлен успешно. Контент 18+ теперь защищен.",
          duration: 4000,
          className: "bg-green-50 border-green-200 text-green-800",
        })
        setPin('')
        setError('')
        onClose()
        if (onPinSetup) {
          onPinSetup(pin)
        }
      } else {
        toast({
          title: "Ошибка установки PIN-кода",
          description: "Не удалось установить PIN-код. Попробуйте еще раз.",
          variant: "destructive",
          duration: 4000,
        })
        setError('Ошибка при установке PIN-кода')
        setTimeout(() => {
          setPin('')
        }, 100)
      }
    } else if (disableMode) {
      // Режим отключения родительского контроля
      const success = disableParentalControl(pin)
      if (success) {
        toast({
          title: "Родительский контроль отключен",
          description: "Все ограничения сняты. Доступ к контенту 18+ разрешен.",
          duration: 4000,
          className: "bg-blue-50 border-blue-200 text-blue-800",
        })
        setPin('')
        setError('')
        onClose()
        if (onPinDisable) {
          onPinDisable()
        }
      } else {
        toast({
          title: "Неверный PIN-код",
          description: "Введенный PIN-код не совпадает с установленным.",
          variant: "destructive",
          duration: 4000,
        })
        setError('Неверный PIN-код')
        setTimeout(() => {
          setPin('')
        }, 100)
      }
    } else {
      // Режим валидации PIN-кода
      if (validatePin(pin)) {
        // Добавляем фильм в список разблокированных
        if (movie?.id) {
          addUnlockedMovie(movie.id)
        }
        toast({
          title: "Доступ разрешен",
          description: `Вы можете просматривать "${movie?.title || 'контент'}".`,
          duration: 3000,
          className: "bg-green-50 border-green-200 text-green-800",
        })
        setPin('')
        setError('')
        onClose()
        if (onAccessGranted) {
          onAccessGranted(movie)
        }
      } else {
        toast({
          title: "Доступ запрещен",
          description: "Неверный PIN-код. Попробуйте еще раз.",
          variant: "destructive",
          duration: 4000,
        })
        setError('Неверный PIN-код')
        // Очищаем поле ввода при ошибке для лучшего UX
        setTimeout(() => {
          setPin('')
        }, 100)
      }
    }
  }

  const handleCancel = () => {
    setPin('')
    setError('')
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-500" />
            {setupMode ? 'Установка родительского контроля' : 
             disableMode ? 'Отключение родительского контроля' : 
             'Возрастные ограничения'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {setupMode ? (
              'Создайте 4-значный PIN-код для защиты настроек родительского контроля'
            ) : disableMode ? (
              'Введите установленный PIN-код для отключения родительского контроля'
            ) : (
              <>
                Контент "{movie?.title}" имеет возрастные ограничения {movie?.age}+.
                <br />
                Введите PIN-код для продолжения просмотра.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col items-center py-4 space-y-3">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={handlePinComplete}
            className="gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className={`w-12 h-12 text-lg ${error ? 'border-red-500' : ''}`} />
              <InputOTPSlot index={1} className={`w-12 h-12 text-lg ${error ? 'border-red-500' : ''}`} />
              <InputOTPSlot index={2} className={`w-12 h-12 text-lg ${error ? 'border-red-500' : ''}`} />
              <InputOTPSlot index={3} className={`w-12 h-12 text-lg ${error ? 'border-red-500' : ''}`} />
            </InputOTPGroup>
          </InputOTP>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm animate-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={pin.length !== 4}
            className="bg-primary hover:bg-primary/90"
          >
            Подтвердить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AdultContentDialog