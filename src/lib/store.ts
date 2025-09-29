'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { Bill, LineItem, Person, Adjustment, Assignment, BillSummary } from './types';
import { calculateBillSummary } from './calculations';

const PERSON_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'
];

interface BillStore {
  bill: Bill;

  // Line Items
  addLineItem: (name: string, price: number, quantity?: number) => void;
  updateLineItem: (id: string, updates: Partial<LineItem>) => void;
  deleteLineItem: (id: string) => void;

  // People
  addPerson: (name: string) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;

  // Adjustments
  addAdjustment: (type: 'fee' | 'tip' | 'tax', description: string, value: number, isPercentage: boolean) => void;
  updateAdjustment: (id: string, updates: Partial<Adjustment>) => void;
  deleteAdjustment: (id: string) => void;

  // Assignments
  togglePersonAssignment: (itemId: string, personId: string) => void;
  assignAllPeopleToItem: (itemId: string) => void;
  clearItemAssignments: (itemId: string) => void;

  // Calculations
  getBillSummary: () => BillSummary;

  // Utility
  resetBill: () => void;
  updateBillName: (name: string) => void;
}

const createEmptyBill = (): Bill => ({
  id: nanoid(),
  name: 'New Bill',
  items: [],
  people: [],
  adjustments: [],
  assignments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useBillStore = create<BillStore>()(
  persist(
    (set, get) => ({
      bill: createEmptyBill(),

      addLineItem: (name: string, price: number, quantity = 1) =>
        set((state) => {
          const newItem: LineItem = {
            id: nanoid(),
            name,
            price,
            quantity,
          };

          const updatedBill = {
            ...state.bill,
            items: [...state.bill.items, newItem],
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      updateLineItem: (id: string, updates: Partial<LineItem>) =>
        set((state) => {
          const updatedBill = {
            ...state.bill,
            items: state.bill.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      deleteLineItem: (id: string) =>
        set((state) => {
          const updatedBill = {
            ...state.bill,
            items: state.bill.items.filter((item) => item.id !== id),
            assignments: state.bill.assignments.filter((assignment) => assignment.itemId !== id),
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      addPerson: (name: string) =>
        set((state) => {
          const colorIndex = state.bill.people.length % PERSON_COLORS.length;
          const newPerson: Person = {
            id: nanoid(),
            name,
            color: PERSON_COLORS[colorIndex],
          };

          const updatedBill = {
            ...state.bill,
            people: [...state.bill.people, newPerson],
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      updatePerson: (id: string, updates: Partial<Person>) =>
        set((state) => {
          const updatedBill = {
            ...state.bill,
            people: state.bill.people.map((person) =>
              person.id === id ? { ...person, ...updates } : person
            ),
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      deletePerson: (id: string) =>
        set((state) => {
          const updatedBill = {
            ...state.bill,
            people: state.bill.people.filter((person) => person.id !== id),
            assignments: state.bill.assignments.map((assignment) => ({
              ...assignment,
              personIds: assignment.personIds.filter((personId) => personId !== id),
            })).filter((assignment) => assignment.personIds.length > 0),
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      addAdjustment: (type: 'fee' | 'tip' | 'tax', description: string, value: number, isPercentage: boolean) =>
        set((state) => {
          const newAdjustment: Adjustment = {
            id: nanoid(),
            type,
            description,
            value,
            isPercentage,
          };

          const updatedBill = {
            ...state.bill,
            adjustments: [...state.bill.adjustments, newAdjustment],
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      updateAdjustment: (id: string, updates: Partial<Adjustment>) =>
        set((state) => {
          const updatedBill = {
            ...state.bill,
            adjustments: state.bill.adjustments.map((adjustment) =>
              adjustment.id === id ? { ...adjustment, ...updates } : adjustment
            ),
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      deleteAdjustment: (id: string) =>
        set((state) => {
          const updatedBill = {
            ...state.bill,
            adjustments: state.bill.adjustments.filter((adjustment) => adjustment.id !== id),
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      togglePersonAssignment: (itemId: string, personId: string) =>
        set((state) => {
          const existingAssignment = state.bill.assignments.find((a) => a.itemId === itemId);
          let updatedAssignments;

          if (existingAssignment) {
            const isPersonAssigned = existingAssignment.personIds.includes(personId);
            if (isPersonAssigned) {
              const updatedPersonIds = existingAssignment.personIds.filter((id) => id !== personId);
              if (updatedPersonIds.length === 0) {
                updatedAssignments = state.bill.assignments.filter((a) => a.itemId !== itemId);
              } else {
                updatedAssignments = state.bill.assignments.map((a) =>
                  a.itemId === itemId ? { ...a, personIds: updatedPersonIds } : a
                );
              }
            } else {
              updatedAssignments = state.bill.assignments.map((a) =>
                a.itemId === itemId
                  ? { ...a, personIds: [...a.personIds, personId] }
                  : a
              );
            }
          } else {
            const newAssignment: Assignment = {
              itemId,
              personIds: [personId],
            };
            updatedAssignments = [...state.bill.assignments, newAssignment];
          }

          const updatedBill = {
            ...state.bill,
            assignments: updatedAssignments,
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      assignAllPeopleToItem: (itemId: string) =>
        set((state) => {
          const allPersonIds = state.bill.people.map((person) => person.id);
          const existingAssignmentIndex = state.bill.assignments.findIndex((a) => a.itemId === itemId);

          let updatedAssignments;
          if (existingAssignmentIndex >= 0) {
            updatedAssignments = state.bill.assignments.map((assignment, index) =>
              index === existingAssignmentIndex
                ? { ...assignment, personIds: allPersonIds }
                : assignment
            );
          } else {
            const newAssignment: Assignment = {
              itemId,
              personIds: allPersonIds,
            };
            updatedAssignments = [...state.bill.assignments, newAssignment];
          }

          const updatedBill = {
            ...state.bill,
            assignments: updatedAssignments,
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      clearItemAssignments: (itemId: string) =>
        set((state) => {
          const updatedBill = {
            ...state.bill,
            assignments: state.bill.assignments.filter((assignment) => assignment.itemId !== itemId),
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),

      getBillSummary: () => {
        const { bill } = get();
        return calculateBillSummary(bill);
      },

      resetBill: () =>
        set(() => ({
          bill: createEmptyBill(),
        })),

      updateBillName: (name: string) =>
        set((state) => {
          const updatedBill = {
            ...state.bill,
            name,
            updatedAt: new Date().toISOString(),
          };

          return { bill: updatedBill };
        }),
    }),
    {
      name: 'bill-splitter-storage',
      skipHydration: true,
    }
  )
);