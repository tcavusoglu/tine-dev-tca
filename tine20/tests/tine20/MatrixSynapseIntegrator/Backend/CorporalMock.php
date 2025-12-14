<?php

/**
 * MatrixSynapseIntegrator Backend
 *
 * @package      MatrixSynapseIntegrator
 * @subpackage   Backend
 * @license      https://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2025 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schüle <p.schuele@metaways.de>
 */

/**
 * MatrixSynapseIntegrator Backend Mock
 *
 * @package      MatrixSynapseIntegrator
 * @subpackage   Backend
 */
class MatrixSynapseIntegrator_Backend_CorporalMock extends MatrixSynapseIntegrator_Backend_Corporal
{
    public function push(MatrixSynapseIntegrator_Model_MatrixAccount $matrixAccount): bool
    {
        $this->_policy = $this->_getPolicy($matrixAccount);
        return true;
    }
}
