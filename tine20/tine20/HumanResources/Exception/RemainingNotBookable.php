<?php
/**
 * Tine 2.0
 *
 * @package     HumanResources
 * @subpackage  Exception
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2013 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Alexander Stintzing <a.stintzing@metaways.de>
 *
 */

/**
 * No  Contract Exception
 *
 * @package     HumanResources
 * @subpackage  Exception
 */
class HumanResources_Exception_RemainingNotBookable extends HumanResources_Exception
{
    /**
     * the title of the Exception (may be shown in a dialog)
     *
     * @var string
     */
    protected $_title = 'Not allowed!'; // _('Not allowed!')
    
    /**
     * @see SPL Exception
     */
    protected $message = "It's only allowed to book remaining vacation days from years in the past!"; // _("It's only allowed to book remaining vacation days from years in the past!")
    
    /**
     * @see SPL Exception
     */
    protected $code = 913;
}
