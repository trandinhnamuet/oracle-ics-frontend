'use client'

import { useEffect } from 'react'

/**
 * Patches Node.prototype.removeChild and insertBefore to silently ignore
 * the "node is not a child" error caused by browser translation tools
 * (e.g. Google Translate) mutating the DOM in a way that breaks React reconciliation.
 */
export function DomPatchProvider() {
  useEffect(() => {
    const originalRemoveChild = Node.prototype.removeChild

    // @ts-expect-error – intentional generic override
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        // Node was already moved/removed by browser translation – silently skip
        return child
      }
      return originalRemoveChild.call(this, child) as T
    }

    const originalInsertBefore = Node.prototype.insertBefore

    // @ts-expect-error – intentional generic override
    Node.prototype.insertBefore = function <T extends Node>(
      newNode: T,
      referenceNode: Node | null,
    ): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        // Reference node was moved by browser translation – append instead
        return this.appendChild(newNode) as T
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T
    }

    // No cleanup needed – patch should stay for the lifetime of the page
  }, [])

  return null
}
