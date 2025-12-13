import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: number;
  text: string;
  time: string;
  isSent: boolean;
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-messages',
  imports: [],
  templateUrl: './messages.component.html',
  styles: ``
})
export class MessagesComponent {

  newMessage: string = '';
  
  conversations: Conversation[] = [
    {
      id: 1,
      name: 'Carlos Martínez',
      avatar: 'https://i.pravatar.cc/40?img=12',
      lastMessage: 'Perfecto, nos vemos mañana',
      time: 'Hace 5 min',
      unreadCount: 2,
      isOnline: true,
      isActive: true
    },
    {
      id: 2,
      name: 'Ana Rodríguez',
      avatar: 'https://i.pravatar.cc/40?img=47',
      lastMessage: '¿Está disponible el apartamento?',
      time: 'Hace 1 hora',
      unreadCount: 0,
      isOnline: false,
      isActive: false
    },
    {
      id: 3,
      name: 'Juan Pérez',
      avatar: 'https://i.pravatar.cc/40?img=33',
      lastMessage: 'Muchas gracias por todo',
      time: 'Hace 3 horas',
      unreadCount: 0,
      isOnline: true,
      isActive: false
    }
  ];

  messages: Message[] = [
    {
      id: 1,
      text: 'Hola, me interesa alquilar tu Toyota Camry',
      time: '10:30',
      isSent: false
    },
    {
      id: 2,
      text: '¡Hola! Claro, está disponible. ¿Para qué fechas lo necesitas?',
      time: '10:32',
      isSent: true
    },
    {
      id: 3,
      text: 'Lo necesito del 15 al 20 de diciembre',
      time: '10:35',
      isSent: false
    },
    {
      id: 4,
      text: 'Perfecto, esas fechas están libres. El precio es S/45 por día',
      time: '10:36',
      isSent: true
    },
    {
      id: 5,
      text: '¿Incluye seguro?',
      time: '10:38',
      isSent: false
    },
    {
      id: 6,
      text: 'Sí, incluye seguro completo y GPS',
      time: '10:39',
      isSent: true
    },
    {
      id: 7,
      text: 'Perfecto, nos vemos mañana',
      time: '10:42',
      isSent: false
    }
  ];

  activeConversation = this.conversations[0];

  selectConversation(conversation: Conversation): void {
    this.conversations.forEach(c => c.isActive = false);
    conversation.isActive = true;
    this.activeConversation = conversation;
    conversation.unreadCount = 0;
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const now = new Date();
      const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      this.messages.push({
        id: this.messages.length + 1,
        text: this.newMessage,
        time: time,
        isSent: true
      });
      
      this.newMessage = '';
      
      // Scroll al final
      setTimeout(() => {
        const chatContainer = document.querySelector('.overflow-y-auto.p-6');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }
  }
}
