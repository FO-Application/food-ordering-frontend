
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import productService, { type ProductResponse, type OptionGroupResponse, type OptionItemResponse, type OptionGroupRequest, type OptionItemRequest } from '../../../services/productService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

interface OptionManagementProps {
    restaurantSlug: string;
}

const OptionManagement: React.FC<OptionManagementProps> = ({ restaurantSlug }) => {
    const { t } = useTranslation();
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [optionGroups, setOptionGroups] = useState<OptionGroupResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<OptionGroupResponse | null>(null);
    const [groupForm, setGroupForm] = useState<OptionGroupRequest>({
        name: '',
        isMandatory: false,
        minSelection: 0,
        maxSelection: 5,
        productId: 0
    });

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<OptionItemResponse | null>(null);
    const [itemsByGroup, setItemsByGroup] = useState<Record<number, OptionItemResponse[]>>({});
    const [itemForm, setItemForm] = useState<OptionItemRequest>({
        name: '',
        priceAdjustment: 0,
        optionGroupId: 0
    });

    useEffect(() => {
        loadAllProducts();
    }, [restaurantSlug]);

    useEffect(() => {
        if (selectedProductId) {
            loadOptionGroups(selectedProductId);
        } else {
            setOptionGroups([]);
        }
    }, [selectedProductId]);

    const loadAllProducts = async () => {
        setIsLoading(true);
        try {
            const catRes = await productService.getAllCategories(restaurantSlug);
            if (catRes.result) {
                const allProds: ProductResponse[] = [];
                for (const cat of catRes.result) {
                    const prodRes = await productService.getProductsByCategory(cat.id);
                    if (prodRes.result) allProds.push(...prodRes.result);
                }
                setProducts(allProds);
                if (allProds.length > 0) setSelectedProductId(allProds[0].id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadOptionGroups = async (prodId: number) => {
        try {
            const res = await productService.getOptionGroupsByProduct(prodId);
            if (res.result) {
                setOptionGroups(res.result);
                const newItemsByGroup: Record<number, OptionItemResponse[]> = {};
                for (const grp of res.result) {
                    try {
                        const itemRes = await productService.getOptionItemsByGroup(grp.id);
                        if (itemRes.result) {
                            newItemsByGroup[grp.id] = itemRes.result;
                        } else {
                            newItemsByGroup[grp.id] = [];
                        }
                    } catch {
                        newItemsByGroup[grp.id] = [];
                    }
                }
                setItemsByGroup(newItemsByGroup);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadItemsForGroup = async (grpId: number) => {
        try {
            const res = await productService.getOptionItemsByGroup(grpId);
            if (res.result) {
                setItemsByGroup(prev => ({ ...prev, [grpId]: res.result }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: OptionGroupRequest = {
                name: groupForm.name,
                isMandatory: groupForm.isMandatory,
                minSelection: groupForm.minSelection,
                maxSelection: groupForm.maxSelection,
                productId: selectedProductId!
            };
            if (editingGroup) {
                await productService.updateOptionGroup(editingGroup.id, payload);
            } else {
                await productService.createOptionGroup(payload);
            }
            loadOptionGroups(selectedProductId!);
            setIsGroupModalOpen(false);
            resetGroupForm();
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        }
    };

    const deleteGroup = async (id: number) => {
        if (window.confirm(t('menu.deleteOptionGroupConfirm'))) {
            await productService.deleteOptionGroup(id);
            loadOptionGroups(selectedProductId!);
        }
    };

    const openCreateGroupModal = () => {
        resetGroupForm();
        setGroupForm(prev => ({ ...prev, productId: selectedProductId! }));
        setIsGroupModalOpen(true);
    };

    const openEditGroupModal = (grp: OptionGroupResponse) => {
        setEditingGroup(grp);
        setGroupForm({
            name: grp.name,
            isMandatory: grp.isMandatory,
            minSelection: grp.minSelection,
            maxSelection: grp.maxSelection,
            productId: selectedProductId!
        });
        setIsGroupModalOpen(true);
    };

    const resetGroupForm = () => {
        setEditingGroup(null);
        setGroupForm({ name: '', isMandatory: false, minSelection: 0, maxSelection: 5, productId: selectedProductId || 0 });
    };

    const handleItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: OptionItemRequest = { name: itemForm.name, priceAdjustment: itemForm.priceAdjustment, optionGroupId: currentGroupId! };
            if (editingItem) {
                await productService.updateOptionItem(editingItem.id, payload);
            } else {
                await productService.createOptionItem(payload);
            }
            loadItemsForGroup(currentGroupId!);
            setIsItemModalOpen(false);
            resetItemForm();
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        }
    };

    const deleteItem = async (id: number, grpId: number) => {
        if (window.confirm(t('menu.deleteOptionItemConfirm'))) {
            await productService.deleteOptionItem(id);
            loadItemsForGroup(grpId);
        }
    };

    const openCreateItemModal = (grpId: number) => {
        resetItemForm();
        setCurrentGroupId(grpId);
        setItemForm(prev => ({ ...prev, optionGroupId: grpId }));
        setIsItemModalOpen(true);
    };

    const openEditItemModal = (item: OptionItemResponse, grpId: number) => {
        setEditingItem(item);
        setCurrentGroupId(grpId);
        setItemForm({ name: item.name, priceAdjustment: item.priceAdjustment, optionGroupId: grpId });
        setIsItemModalOpen(true);
    };

    const resetItemForm = () => {
        setEditingItem(null);
        setItemForm({ name: '', priceAdjustment: 0, optionGroupId: currentGroupId || 0 });
    };

    if (isLoading) return <LoadingSpinner message={t('common.loading')} size="medium" />;

    return (
        <div className="option-management">
            <div className="management-header">
                <h3 className="management-title">{t('menu.options')}</h3>
            </div>

            {products.length === 0 ? (
                <div className="empty-state">
                    <h4>{t('menu.noProducts')}</h4>
                    <p>{t('menu.noProductsDesc')}</p>
                </div>
            ) : (
                <>
                    <div className="option-toolbar">
                        <select className="form-select" value={selectedProductId || ''} onChange={(e) => setSelectedProductId(Number(e.target.value))}>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button className="btn-primary" onClick={openCreateGroupModal}>{t('menu.addOptionGroup')}</button>
                    </div>

                    {optionGroups.length === 0 ? (
                        <div className="empty-state">
                            <h4>{t('common.noData')}</h4>
                            <p>{t('menu.addOptionGroup')} (Size, Topping...)</p>
                        </div>
                    ) : (
                        <table className="option-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '30%' }}>{t('menu.optionGroup')} / {t('menu.options')}</th>
                                    <th style={{ width: '20%' }}>{t('menu.required')}</th>
                                    <th style={{ width: '15%' }}>{t('menu.minSelect')}/{t('menu.maxSelect')}</th>
                                    <th style={{ width: '15%', textAlign: 'right' }}>{t('menu.priceAdjustment')}</th>
                                    <th style={{ width: '20%', textAlign: 'right' }}>{t('orders.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {optionGroups.map(grp => (
                                    <React.Fragment key={grp.id}>
                                        <tr className="group-row">
                                            <td><strong>{grp.name}</strong></td>
                                            <td><span className={`badge ${grp.isMandatory ? 'badge-required' : 'badge-optional'}`}>{grp.isMandatory ? t('menu.required') : t('menu.optional')}</span></td>
                                            <td>{grp.minSelection} - {grp.maxSelection}</td>
                                            <td></td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="link-btn" onClick={() => openCreateItemModal(grp.id)}>{t('common.add')}</button>
                                                <button className="link-btn" onClick={() => openEditGroupModal(grp)}>{t('menu.edit')}</button>
                                                <button className="link-btn danger" onClick={() => deleteGroup(grp.id)}>{t('menu.delete')}</button>
                                            </td>
                                        </tr>
                                        {(itemsByGroup[grp.id] || []).map(item => (
                                            <tr key={item.id} className="item-row">
                                                <td style={{ paddingLeft: 24 }}>{item.name}</td>
                                                <td></td>
                                                <td></td>
                                                <td style={{ textAlign: 'right' }}>+{item.priceAdjustment.toLocaleString()}đ</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="link-btn" onClick={() => openEditItemModal(item, grp.id)}>{t('menu.edit')}</button>
                                                    <button className="link-btn danger" onClick={() => deleteItem(item.id, grp.id)}>{t('menu.delete')}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}

            {isGroupModalOpen && (
                <div className="modal-overlay" onClick={() => setIsGroupModalOpen(false)}>
                    <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingGroup ? t('menu.edit') : t('menu.addOptionGroup')}</h3>
                            <button className="close-btn" onClick={() => setIsGroupModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleGroupSubmit}>
                            <div className="form-group">
                                <label>{t('menu.optionName')}</label>
                                <input className="form-input" value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} required placeholder={t('menu.optionName')} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('menu.required')}?</label>
                                    <select className="form-select" value={String(groupForm.isMandatory)} onChange={e => setGroupForm({ ...groupForm, isMandatory: e.target.value === 'true' })}>
                                        <option value="false">{t('common.no') || 'No'}</option>
                                        <option value="true">{t('common.yes') || 'Yes'}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>{t('menu.minSelect')}</label>
                                    <input type="number" className="form-input" value={groupForm.minSelection} onChange={e => setGroupForm({ ...groupForm, minSelection: Number(e.target.value) })} min={0} />
                                </div>
                                <div className="form-group">
                                    <label>{t('menu.maxSelect')}</label>
                                    <input type="number" className="form-input" value={groupForm.maxSelection} onChange={e => setGroupForm({ ...groupForm, maxSelection: Number(e.target.value) })} min={1} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsGroupModalOpen(false)}>{t('common.cancel')}</button>
                                <button type="submit" className="btn-primary">{t('common.save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isItemModalOpen && (
                <div className="modal-overlay" onClick={() => setIsItemModalOpen(false)}>
                    <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingItem ? t('menu.edit') : t('menu.addOption')}</h3>
                            <button className="close-btn" onClick={() => setIsItemModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleItemSubmit}>
                            <div className="form-group">
                                <label>{t('menu.optionName')}</label>
                                <input className="form-input" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} required placeholder={t('menu.optionName')} />
                            </div>
                            <div className="form-group">
                                <label>{t('menu.priceAdjustment')} (VNĐ)</label>
                                <input type="number" className="form-input" value={itemForm.priceAdjustment} onChange={e => setItemForm({ ...itemForm, priceAdjustment: Number(e.target.value) })} min={0} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsItemModalOpen(false)}>{t('common.cancel')}</button>
                                <button type="submit" className="btn-primary">{t('common.save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptionManagement;
